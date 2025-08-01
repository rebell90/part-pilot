import { vehicleData } from '../data/vehicle-data';
import { useState, useEffect } from 'react';

export default function CompatibilityPage() {
  const [make, setMake] = useState('');
  const [year, setYear] = useState('');
  const [model, setModel] = useState('');
  const [products, setProducts] = useState([]);

  const makes = Object.keys(vehicleData);
  const years = make ? Object.keys(vehicleData[make]) : [];
  const models = make && year ? vehicleData[make][year] : [];

  useEffect(() => {
    if (make && year && model) {
      const tag = model.tag; // use the tag value!
      fetch(`/api/products/search?vehicle=${encodeURIComponent(tag)}`)
        .then(res => res.json())
        .then(setProducts);
    } else {
      setProducts([]);
    }
  }, [make, year, model]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Find Compatible Parts</h2>
      <label>Make: </label>
      <select value={make} onChange={e => { setMake(e.target.value); setYear(''); setModel(''); }}>
        <option value="">--</option>
        {makes.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      {make && (
        <>
          <label> Year: </label>
          <select value={year} onChange={e => { setYear(e.target.value); setModel(''); }}>
            <option value="">--</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </>
      )}

      {year && (
        <>
          <label> Model: </label>
          <select
            value={model.tag || ""}
            onChange={e => {
              const selectedModel = models.find(m => m.tag === e.target.value);
              setModel(selectedModel || {});
            }}
          >
            <option value="">--</option>
            {models.map(m => (
              <option key={m.tag} value={m.tag}>{m.model}</option>
            ))}
          </select>
        </>
      )}

      {products.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h4>Compatible Parts:</h4>
          <ul>
            {products.map(p => (
              <li key={p.id}>
                <img src={p.featuredImage?.url} alt={p.title} width={60} />
                <a href={`/products/${p.handle}`} target="_blank" rel="noreferrer">{p.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
