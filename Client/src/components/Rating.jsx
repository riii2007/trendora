// shows stars for a rating between 0 and 5
export default function Rating({ value = 0 }) {
  const full = Math.round(value);
  return (
    <span className="rating">
      <span className="stars">{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
      <span className="rating-num">{Number(value).toFixed(1)}</span>
    </span>
  );
}
