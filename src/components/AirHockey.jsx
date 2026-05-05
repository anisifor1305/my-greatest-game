import React, { useRef, useEffect } from 'react';
import './AirHockey.css';

const AirHockey = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    canvas.width = 800;
    canvas.height = 400;
    
    const player = {
      x: 50,
      y: canvas.height / 2,
      radius: 30,
      color: '#38bdf8'
    };

    const computer = {
      x: canvas.width - 50,
      y: canvas.height / 2,
      radius: 30,
      color: '#f43f5e'
    };

    const puck = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 15,
      color: '#fbbf24'
    };

    const drawTable = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 10;
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#38bdf8';
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      ctx.shadowBlur = 0;
      
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f43f5e';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 8;
      
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2 - 70);
      ctx.lineTo(0, canvas.height / 2 + 70);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(canvas.width, canvas.height / 2 - 70);
      ctx.lineTo(canvas.width, canvas.height / 2 + 70);
      ctx.stroke();
      
      ctx.shadowBlur = 0;
    };

    const drawPaddle = (x, y, radius, color) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = color;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(x, y, radius - 10, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawPuck = () => {
      ctx.beginPath();
      ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
      ctx.fillStyle = puck.color;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(puck.x, puck.y, puck.radius - 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const render = () => {
      drawTable();
      drawPaddle(player.x, player.y, player.radius, player.color);
      drawPaddle(computer.x, computer.y, computer.radius, computer.color);
      drawPuck();
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="game-container">
      <div className="score-board">
        <div className="player-score">0</div>
        <div className="score-divider">VS</div>
        <div className="computer-score">0</div>
      </div>
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  );
};

export default AirHockey;
