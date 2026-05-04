import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', color: '#d9534f' }}>404</h1>
      <h2>Бет табылмады (Not Found)</h2>
      <p>Кешіріңіз, сіз іздеген бет жоқ.</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '5px' }}>
          Басты бетке қайту
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
