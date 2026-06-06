export function QuantityControl({ label, value, min = 1, max = 999, onChange }) {
  return (
    <label className="quantity-control">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value || min, 10);
          onChange(Math.max(min, Math.min(max, parsed)));
        }}
      />
    </label>
  );
}
