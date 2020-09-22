const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function getPdfBufferFromHtml({
  templatePath,
  templateFileName,
  // templateData,
}) {
  const pdfDoc = await PDFDocument.create();

  const path = `${templatePath}/${templateFileName}`;

  const donorPdfBytes = fs.readFileSync(path);

  const donorPdfDoc = await PDFDocument.load(donorPdfBytes);

  const [page] = await pdfDoc.copyPages(donorPdfDoc, [0]);

  pdfDoc.addPage(page);

  // fs.writeFileSync('./toto.pdf', await pdfDoc.save());

  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
}

module.exports = {
  getPdfBufferFromHtml,
};
