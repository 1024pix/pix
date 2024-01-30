import fs from 'fs/promises';
import path from 'node:path';
import os from 'os';

async function removeTempFile(filePath) {
  return (
    fs
      .access(filePath)
      .then(() => fs.unlink(filePath))
      // biome-ignore lint: no empty block
      .catch(() => {})
  );
}

async function createTempFile(file, data) {
  const filePath = path.join(os.tmpdir(), file);
  await removeTempFile(filePath);
  await fs.writeFile(filePath, data);
  return filePath;
}

export { removeTempFile, createTempFile };
