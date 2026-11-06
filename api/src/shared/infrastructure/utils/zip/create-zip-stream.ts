import { promisify } from 'node:util';

import ZipStream from 'zip-stream';
import { logger } from '../logger.js';

type Result = {
  name: string;
  content: Buffer | string;
};

type Deps = {
  logger: typeof logger;
};

export function createZipStream(
  func: (arg: object) => Promise<Result>,
  args: Array<object>,
  dependencies: Deps = { logger },
): ZipStream {
  const archive = new ZipStream();
  archive.on('error', function (err) {
    dependencies.logger.error(err, 'Problem occurred during archive streaming');
  });

  void buildData(func, args, archive);
  return archive;
}

async function buildData(func: (arg: object) => Promise<Result>, args: Array<object>, archive: ZipStream) {
  const addEntry = promisify(archive.entry.bind(archive));
  try {
    for (const arg of args) {
      const result = await func(arg);
      await addEntry(result.content, { name: result.name });
    }
  } catch (err) {
    archive.destroy(err as Error);
  }
  archive.finalize();
}
