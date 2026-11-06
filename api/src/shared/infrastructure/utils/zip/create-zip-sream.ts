import { promisify } from 'node:util';

import ZipStream from 'zip-stream';

type Result = {
  name: string;
  content: Buffer | string;
};

export function createZipStream(func: (arg: object) => Promise<Result>, args: Array<object>): ZipStream {
  const archive = new ZipStream();
  void buildData(func, args, archive);
  return archive;
}

async function buildData(func: (arg: object) => Promise<Result>, args: Array<object>, archive: ZipStream) {
  const addEntry = promisify(archive.entry.bind(archive));
  for (const arg of args) {
    const result = await func(arg);
    await addEntry(result.content, { name: result.name });
  }
  archive.finalize();
}
