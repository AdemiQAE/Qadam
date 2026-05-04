import Button from './Button';

function Card({ title, description, btnText }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      <p style={styles.text}>{description}</p>
      {btnText && <Button text={btnText} onClick={() => alert(`${title} таңдалды!`)} />}
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    margin: '10px 0',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  text: {
    margin: '10px 0',
    color: '#555'
  }
};

export default Card;
