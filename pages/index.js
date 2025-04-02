import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [holders, setHolders] = useState([]);
  const [loadingHolders, setLoadingHolders] = useState(true);
  const [formData, setFormData] = useState({
    certificateHolder: '',
    prefilledField: 'Pre-filled Value',
    userField: '',
  });
  const [pdfUrl, setPdfUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch('/api/getHolders')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch holders');
        }
        return res.json();
      })
      .then((data) => {
        setHolders(data);
        setLoadingHolders(false);
      })
      .catch((err) => {
        console.error('Error fetching holders:', err);
        setErrorMessage('Error loading certificate holders.');
        setLoadingHolders(false);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setPdfUrl(null);
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
      const errData = await res.json();
      console.error('Failed to generate PDF', errData);
      setErrorMessage('Failed to generate PDF. Please check server logs.');
    }
  };

  return (
    <div className={styles.container}>
      <h1>ACORD 25 Form Filler</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="certificateHolder">Certificate Holder:</label>
          {loadingHolders ? (
            <p>Loading certificate holders...</p>
          ) : (
            <select
              id="certificateHolder"
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
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="prefilledField">Prefilled Field:</label>
          <input
            id="prefilledField"
            type="text"
            name="prefilledField"
            value={formData.prefilledField}
            readOnly
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="userField">User Field:</label>
          <input
            id="userField"
            type="text"
            name="userField"
            value={formData.userField}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className={styles.button}>Generate PDF</button>
      </form>
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      {pdfUrl && (
        <div className={styles.download}>
          <h2>Download Your Filled Form</h2>
          <a href={pdfUrl} download="Acord25_filled.pdf">Download PDF</a>
        </div>
      )}
    </div>
  );
}
