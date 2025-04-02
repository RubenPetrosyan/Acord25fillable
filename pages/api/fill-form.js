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
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Get the form so that we can fill out the fields.
    const form = pdfDoc.getForm();

    // Fill in the fields.
    // Ensure that the field names below match those in your ACORD25 PDF.
    if (formData.certificateHolder) {
      const field = form.getTextField('certificateHolder');
      field.setText(formData.certificateHolder);
    }
    if (formData.prefilledField) {
      const field = form.getTextField('prefilledField');
      field.setText(formData.prefilledField);
    }
    if (formData.userField) {
      const field = form.getTextField('userField');
      field.setText(formData.userField);
    }

    // Optionally, flatten the form so the fields become regular text.
    form.flatten();

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Acord25_filled.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fill form.' });
  }
}
