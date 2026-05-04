import React from 'react';

function Button({ text, onClick, styleType = "primary" }) {
  const baseStyle = {
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: '10px'
  };

  const types = {
    primary: { backgroundColor: '#007bff', color: '#fff' },
    secondary: { backgroundColor: '#6c757d', color: '#fff' }
  };

  return (
    <button style={{ ...baseStyle, ...types[styleType] }} onClick={onClick}>
      {text}
    </button>
  );
}

export default Button;
