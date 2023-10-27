import { readdir } from 'node:fs/promises';

export async function countFilesInPath(path) {
  let fileNumber = 0;
  const files = await readdir(path, { recursive: true, withFileTypes: true });

  for (const file of files) {
    if (file.isFile()) {
      fileNumber++;
    }
  }
  return fileNumber;
}

export class BoundedContextDirectory {
  constructor({ name, fileCount }) {
    this.name = name;
    this.fileCount = fileCount;
  }

  toString() {
    return `${this.name}: ${this.fileCount}`;
  }
}

export async function boundedContextDirectories() {
  const basePath = './src';
  const files = await readdir(basePath, { recursive: false, withFileTypes: true });
  const boundedContexts = [];
  for await (const file of files) {
    if (file.isDirectory()) {
      const { name } = file;
      const fileCount = await countFilesInPath(`${basePath}/${name}`);
      boundedContexts.push(new BoundedContextDirectory({ name, fileCount }));
    }
  }
  return boundedContexts;
}
