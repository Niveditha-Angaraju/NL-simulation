import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const BACKEND_URL = 'http://localhost:8000'; // Change if backend runs elsewhere

function App() {
  const canvasRef = useRef(null);
  const [grid, setGrid] = useState({ grid_size_x: 10, grid_size_y: 10, resources: [] });
  const [state, setState] = useState({ agent_pos: [0, 0], path: [[0, 0]], goal_pos: [9, 9] });
  const CELL_SIZE = 32;
  const MARGIN = 2;

  // Fetch grid info on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/grid`)
      .then(res => res.json())
      .then(setGrid);
    fetch(`${BACKEND_URL}/state`)
      .then(res => res.json())
      .then(setState);
  }, []);

  // Draw grid, resources, agent
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    for (let x = 0; x < grid.grid_size_x; x++) {
      for (let y = 0; y < grid.grid_size_y; y++) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(
          x * (CELL_SIZE + MARGIN),
          (grid.grid_size_y - 1 - y) * (CELL_SIZE + MARGIN),
          CELL_SIZE, CELL_SIZE
        );
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(
          x * (CELL_SIZE + MARGIN),
          (grid.grid_size_y - 1 - y) * (CELL_SIZE + MARGIN),
          CELL_SIZE, CELL_SIZE
        );
      }
    }

    // Draw resources (books)
    for (const [rx, ry] of grid.resources) {
      ctx.fillStyle = '#222';
      ctx.font = '20px sans-serif';
      ctx.fillText('📚',
        rx * (CELL_SIZE + MARGIN) + 6,
        (grid.grid_size_y - 1 - ry) * (CELL_SIZE + MARGIN) + 24
      );
    }

    // Draw path
    ctx.fillStyle = 'rgba(255,0,0,0.2)';
    for (const [px, py] of state.path) {
      ctx.fillRect(
        px * (CELL_SIZE + MARGIN),
        (grid.grid_size_y - 1 - py) * (CELL_SIZE + MARGIN),
        CELL_SIZE, CELL_SIZE
      );
    }

    // Draw goal
    const [gx, gy] = state.goal_pos;
    ctx.fillStyle = '#0a0';
    ctx.fillRect(
      gx * (CELL_SIZE + MARGIN),
      (grid.grid_size_y - 1 - gy) * (CELL_SIZE + MARGIN),
      CELL_SIZE, CELL_SIZE
    );

    // Draw agent (in red)
    const [ax, ay] = state.agent_pos;
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(
      ax * (CELL_SIZE + MARGIN) + CELL_SIZE / 2,
      (grid.grid_size_y - 1 - ay) * (CELL_SIZE + MARGIN) + CELL_SIZE / 2,
      CELL_SIZE / 2 - 4, 0, 2 * Math.PI
    );
    ctx.fill();
  }, [grid, state]);

  // Step simulation
  const handleStep = () => {
    fetch(`${BACKEND_URL}/step`, { method: 'POST' })
      .then(res => res.json())
      .then(setState);
  };

  // Reset simulation
  const handleReset = () => {
    fetch(`${BACKEND_URL}/reset`, { method: 'POST' })
      .then(res => res.json())
      .then(setState);
  };

  return (
    <div className="App">
      <h2>DQN Grid Simulation (Single Agent)</h2>
      <canvas
        ref={canvasRef}
        width={grid.grid_size_x * (CELL_SIZE + MARGIN)}
        height={grid.grid_size_y * (CELL_SIZE + MARGIN)}
        style={{ border: '1px solid #888', background: '#eee', margin: 16 }}
      />
      <div>
        <button onClick={handleStep}>Step</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div style={{marginTop: 16}}>
        <b>Agent Position:</b> [{state.agent_pos[0]}, {state.agent_pos[1]}]
      </div>
    </div>
  );
}

export default App;
