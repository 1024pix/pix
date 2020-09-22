const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function getPdfBuffer({
  templatePath,
  templateFileName,
}) {
  const pdfDoc = await PDFDocument.create();

  const path = `${templatePath}/${templateFileName}`;

  const donorPdfBytes = await fs.promises.readFile(path);

  const donorPdfDoc = await PDFDocument.load(donorPdfBytes);

  const [page] = await pdfDoc.copyPages(donorPdfDoc, [0]);

  pdfDoc.addPage(page);

  const pdfBytes = await pdfDoc.save();

  return Buffer.from(pdfBytes);
}

module.exports = {
  getPdfBuffer,
};
