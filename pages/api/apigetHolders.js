import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'holders.xlsx');
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'holders.xlsx file not found' });
      return;
    }
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in getHolders:', error);
    res.status(500).json({ error: 'Failed to load certificate holders.' });
  }
}
