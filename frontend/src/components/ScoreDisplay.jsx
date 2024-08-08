import React from 'react';

const ScoreDisplay = ({ score }) => {
  return (
    <div className="score-container">
      <div className="score-label">Score:</div>
      <div className="score-value">{score.toFixed(1)}</div>
    </div>
  );
};

export default ScoreDisplay;