const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const fontkit = require('@pdf-lib/fontkit');

async function getPdfBuffer({
  templatePath,
  templateFileName,
  applyDynamicInformationsInPDF,
  data,
}) {
  const pdfDoc = await PDFDocument.create();

  pdfDoc.registerFontkit(fontkit);

  const path = `${templatePath}/${templateFileName}`;

  const basePdfBytes = await fs.promises.readFile(path);

  const donorPdfDoc = await PDFDocument.load(basePdfBytes);

  const [page] = await pdfDoc.copyPages(donorPdfDoc, [0]);

  await applyDynamicInformationsInPDF({ pdfDoc, page, data, rgb });

  pdfDoc.addPage(page);

  const pdfBytes = await pdfDoc.save();

  return Buffer.from(pdfBytes);
}

module.exports = {
  getPdfBuffer,
};
