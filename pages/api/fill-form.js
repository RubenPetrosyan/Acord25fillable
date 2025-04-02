import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const formData = req.body;

    // Load the ACORD25 PDF from the public folder.
    const pdfPath = path.join(process.cwd(), 'public', 'Acord25.pdf');
    if (!fs.existsSync(pdfPath)) {
      res.status(404).json({ error: 'Acord25.pdf file not found in public folder.' });
      return;
    }
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Get the form so that we can fill out the fields.
    const form = pdfDoc.getForm();

    // Fill in the fields. Adjust the field names as needed.
    try {
      const holderField = form.getTextField('certificateHolder');
      holderField.setText(formData.certificateHolder || '');
    } catch (e) {
      console.warn('certificateHolder field not found in PDF');
    }
    try {
      const prefilledField = form.getTextField('prefilledField');
      prefilledField.setText(formData.prefilledField || '');
    } catch (e) {
      console.warn('prefilledField not found in PDF');
    }
    try {
      const userField = form.getTextField('userField');
      userField.setText(formData.userField || '');
    } catch (e) {
      console.warn('userField not found in PDF');
    }

    // Optionally, flatten the form so the fields become regular text.
    form.flatten();

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Acord25_filled.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error in fill-form:', error);
    res.status(500).json({ error: 'Failed to fill form.' });
  }
}
