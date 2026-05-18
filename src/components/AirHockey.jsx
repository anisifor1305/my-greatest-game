import React, { useRef, useEffect, useState, useCallback } from 'react';
import './AirHockey.css';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GOAL_HALF_HEIGHT = 70;
const FRICTION = 0.99;
const MIN_SPEED = 1.5;
const MAX_SPEED = 14;

const collidePuckWithPaddle = (puck, paddle) => {
  const dx = puck.x - paddle.x;
  const dy = puck.y - paddle.y;
  const dist = Math.hypot(dx, dy);
  const minDist = puck.radius + paddle.radius;
  if (dist >= minDist || dist === 0) return;
  const nx = dx / dist;
  const ny = dy / dist;
  puck.x = paddle.x + nx * minDist;
  puck.y = paddle.y + ny * minDist;
  const relVx = puck.vx - (paddle.vx || 0);
  const relVy = puck.vy - (paddle.vy || 0);
  const dot = relVx * nx + relVy * ny;
  if (dot < 0) {
    puck.vx -= 2 * dot * nx;
    puck.vy -= 2 * dot * ny;
    puck.vx += (paddle.vx || 0) * 0.5;
    puck.vy += (paddle.vy || 0) * 0.5;
  }
};

const AirHockey = () => {
  const canvasRef = useRef(null);
  const playerRef = useRef({ x: 50, y: CANVAS_HEIGHT / 2, radius: 30, prevX: 50, prevY: CANVAS_HEIGHT / 2, vx: 0, vy: 0 });
  const computerRef = useRef({ x: CANVAS_WIDTH - 50, y: CANVAS_HEIGHT / 2, radius: 30 });
  const puckRef = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, radius: 15, vx: 4, vy: 3 });
  const animationIdRef = useRef(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const pausedRef = useRef(false);
  const AI_SPEED = 4;

  const targetRef = useRef({ x: 50, y: CANVAS_HEIGHT / 2 });

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    targetRef.current.x = (e.clientX - rect.left) * scaleX;
    targetRef.current.y = (e.clientY - rect.top) * scaleY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  }, [handleMouseMove]);

  const updatePlayer = useCallback(() => {
    const player = playerRef.current;
    player.prevX = player.x;
    player.prevY = player.y;

    const r = player.radius;
    const targetX = Math.max(r, Math.min(CANVAS_WIDTH / 2 - r, targetRef.current.x));
    const targetY = Math.max(r, Math.min(CANVAS_HEIGHT - r, targetRef.current.y));

    player.x += (targetX - player.x) * 0.35;
    player.y += (targetY - player.y) * 0.35;

    player.vx = player.x - player.prevX;
    player.vy = player.y - player.prevY;
  }, []);

  const clampSpeed = (vx, vy) => {
    const speed = Math.hypot(vx, vy);
    if (speed === 0) return { vx: MIN_SPEED, vy: 0 };
    if (speed > MAX_SPEED) {
      const ratio = MAX_SPEED / speed;
      return { vx: vx * ratio, vy: vy * ratio };
    }
    if (speed < MIN_SPEED) {
      const ratio = MIN_SPEED / speed;
      return { vx: vx * ratio, vy: vy * ratio };
    }
    return { vx, vy };
  };

  const resetRound = useCallback(() => {
    pausedRef.current = true;
    puckRef.current.x = CANVAS_WIDTH / 2;
    puckRef.current.y = CANVAS_HEIGHT / 2;
    puckRef.current.vx = (Math.random() > 0.5 ? 1 : -1) * 4;
    puckRef.current.vy = (Math.random() > 0.5 ? 1 : -1) * 3;
    playerRef.current.x = 50;
    playerRef.current.y = CANVAS_HEIGHT / 2;
    computerRef.current.x = CANVAS_WIDTH - 50;
    computerRef.current.y = CANVAS_HEIGHT / 2;
    setTimeout(() => { pausedRef.current = false; }, 1200);
  }, []);

  const updatePuck = useCallback(() => {
    if (pausedRef.current) return;
    const puck = puckRef.current;

    puck.x += puck.vx;
    puck.y += puck.vy;

    puck.vx *= FRICTION;
    puck.vy *= FRICTION;

    const { vx, vy } = clampSpeed(puck.vx, puck.vy);
    puck.vx = vx;
    puck.vy = vy;

    if (puck.y - puck.radius <= 0) {
      puck.y = puck.radius;
      puck.vy = Math.abs(puck.vy);
    }
    if (puck.y + puck.radius >= CANVAS_HEIGHT) {
      puck.y = CANVAS_HEIGHT - puck.radius;
      puck.vy = -Math.abs(puck.vy);
    }

    collidePuckWithPaddle(puck, playerRef.current);
    collidePuckWithPaddle(puck, computerRef.current);
    const clamped = clampSpeed(puck.vx, puck.vy);
    puck.vx = clamped.vx;
    puck.vy = clamped.vy;

    const goalTop = CANVAS_HEIGHT / 2 - GOAL_HALF_HEIGHT;
    const goalBot = CANVAS_HEIGHT / 2 + GOAL_HALF_HEIGHT;

    if (puck.x - puck.radius <= 0) {
      if (puck.y >= goalTop && puck.y <= goalBot) {
        setComputerScore(s => s + 1);
        resetRound();
      } else {
        puck.x = puck.radius;
        puck.vx = Math.abs(puck.vx);
      }
    }
    if (puck.x + puck.radius >= CANVAS_WIDTH) {
      if (puck.y >= goalTop && puck.y <= goalBot) {
        setPlayerScore(s => s + 1);
        resetRound();
      } else {
        puck.x = CANVAS_WIDTH - puck.radius;
        puck.vx = -Math.abs(puck.vx);
      }
    }
  }, [resetRound]);

  const updateComputer = useCallback(() => {
    if (pausedRef.current) return;
    const comp = computerRef.current;
    const puck = puckRef.current;
    const r = comp.radius;

    comp.prevX = comp.x;
    comp.prevY = comp.y;

    let targetX = CANVAS_WIDTH - 50;
    let targetY;

    if (puck.vx > 0) {
      targetY = puck.y;
      if (puck.x > CANVAS_WIDTH / 2) {
        if (puck.vx < 4) {
          targetX = puck.x;
        } else if (puck.x > CANVAS_WIDTH - 120) {
          targetX = puck.x;
        }
      }
    } else {
      targetY = CANVAS_HEIGHT / 2;
    }

    const dy = targetY - comp.y;
    const stepY = Math.min(Math.abs(dy), AI_SPEED) * Math.sign(dy);
    comp.y += stepY;

    const dx = targetX - comp.x;
    const stepX = Math.min(Math.abs(dx), AI_SPEED) * Math.sign(dx);
    comp.x += stepX;

    comp.y = Math.max(r, Math.min(CANVAS_HEIGHT - r, comp.y));
    comp.x = Math.max(CANVAS_WIDTH / 2 + r, Math.min(CANVAS_WIDTH - r, comp.x));

    comp.vx = comp.x - comp.prevX;
    comp.vy = comp.y - comp.prevY;
  }, []);

  const drawTable = (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, CANVAS_WIDTH - 6, CANVAS_HEIGHT - 6);
    ctx.restore();

    ctx.save();
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const goalTop = CANVAS_HEIGHT / 2 - GOAL_HALF_HEIGHT;
    const goalBot = CANVAS_HEIGHT / 2 + GOAL_HALF_HEIGHT;

    ctx.save();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(3, goalTop);
    ctx.lineTo(3, goalBot);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH - 3, goalTop);
    ctx.lineTo(CANVAS_WIDTH - 3, goalBot);
    ctx.stroke();
    ctx.restore();
  };

  const drawPaddle = (ctx, x, y, radius, color) => {
    ctx.save();

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, radius - 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  };

  const drawPuck = (ctx) => {
    const puck = puckRef.current;
    ctx.save();
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const render = () => {
      updatePlayer();
      updatePuck();
      updateComputer();
      drawTable(ctx);
      drawPaddle(ctx, playerRef.current.x, playerRef.current.y, 30, '#3b82f6');
      drawPaddle(ctx, computerRef.current.x, computerRef.current.y, 30, '#ef4444');
      drawPuck(ctx);
      animationIdRef.current = requestAnimationFrame(render);
    };

    render();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleMouseMove, handleTouchMove, updatePlayer, updatePuck, updateComputer]);

  return (
    <div className="game-container">
      <div className="score-board">
        <div className="player-score">{playerScore}</div>
        <div className="score-divider">VS</div>
        <div className="computer-score">{computerScore}</div>
      </div>
      <canvas ref={canvasRef} className="game-canvas" />
      <div className="controls-hint">Двигай мышкой по левой половине поля</div>
    </div>
  );
};

export default AirHockey;
