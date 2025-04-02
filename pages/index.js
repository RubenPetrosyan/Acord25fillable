import { useState, useEffect } from 'react';

export default function Home() {
  const [holders, setHolders] = useState([]);
  const [formData, setFormData] = useState({
    certificateHolder: '',
    prefilledField: 'Pre-filled Value',
    userField: '',
  });
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    fetch('/api/getHolders')
      .then((res) => res.json())
      .then((data) => setHolders(data))
      .catch((err) => console.error('Error fetching holders:', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/fill-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } else {
      console.error('Failed to generate PDF');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>ACORD 25 Form Filler</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Certificate Holder: </label>
          <select
            name="certificateHolder"
            value={formData.certificateHolder}
            onChange={handleChange}
          >
            <option value="">Select Certificate Holder</option>
            {holders.map((holder, index) => (
              <option key={index} value={holder.Holder || holder.name || holder.certificateHolder}>
                {holder.Holder || holder.name || holder.certificateHolder}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Prefilled Field: </label>
          <input
            type="text"
            name="prefilledField"
            value={formData.prefilledField}
            readOnly
          />
        </div>
        <div>
          <label>User Field: </label>
          <input
            type="text"
            name="userField"
            value={formData.userField}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Generate PDF</button>
      </form>
      {pdfUrl && (
        <div>
          <h2>Download Your Filled Form</h2>
          <a href={pdfUrl} download="Acord25_filled.pdf">Download PDF</a>
        </div>
      )}
    </div>
  );
}
