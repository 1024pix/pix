import { readdir } from 'node:fs/promises';

export async function countFilesInPath(path) {
  let fileNumber = 0;
  const files = await readdir(path, { recursive: true, withFileTypes: true });

  for await (const file of files) {
    if (file.isDirectory()) {
      const directoryFilesNumber = await countFilesInPath(`${path}/${file.name}`);
      fileNumber += directoryFilesNumber;
    } else if (file.isFile()) {
      fileNumber++;
    }
  }
  return fileNumber;
}
