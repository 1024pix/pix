import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

async function removeTempFile(filePath) {
  return (
    fs
      .access(filePath)
      .then(() => fs.unlink(filePath))
      // eslint-disable-next-line no-empty-function
      .catch(() => {})
  );
}

async function createTempFile(file, data) {
  const filePath = path.join(os.tmpdir(), file);
  await removeTempFile(filePath);
  await fs.writeFile(filePath, data);
  return filePath;
}

export { createTempFile, removeTempFile };
