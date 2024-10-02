import { readFile } from 'node:fs/promises';

import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

export async function serialize(templateUrl, entry, creationDate = new Date()) {
  if (Array.isArray(entry)) {
    return serializeArray(templateUrl, entry, creationDate);
  } else {
    return serializeObject(templateUrl, entry, creationDate);
  }
}

async function serializeArray(templateUrl, entries, creationDate) {
  const zip = new JSZip();
  await Promise.all(
    entries.map(async (entry) => {
      const buffer = await serializeObject(templateUrl, entry, creationDate);
      zip.file(entry.get('filename') + '.pdf', buffer);
    }),
  );
  return zip.generateAsync({ type: 'nodebuffer' });
}

async function serializeObject(templateUrl, entry, creationDate) {
  const template = await readFile(templateUrl);
  const pdf = await PDFDocument.load(template);

  pdf.setCreationDate(creationDate);
  pdf.setModificationDate(creationDate);

  const form = pdf.getForm();
  for (const [fieldName, value] of entry) {
    if (fieldName === 'filename') continue;
    const field = form.getTextField(fieldName);
    field.setText(value);
    field.enableReadOnly();
  }
  return Buffer.from(await pdf.save());
}
