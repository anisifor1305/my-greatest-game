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

    const render = () => {
      drawTable();
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
