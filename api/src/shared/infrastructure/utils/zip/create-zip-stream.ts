import { promisify } from 'node:util';

import ZipStream from 'zip-stream';

import { logger } from '../logger.js';

type Result = {
  name: string;
  content: Buffer | string;
};

type LoggerType = typeof logger;

type Deps = {
  logger: LoggerType;
};

export function createZipStream<T>(
  callbackFnc: (arg: T) => Promise<Result>,
  callbackArgs: Array<T>,
  dependencies: Deps = { logger },
): ZipStream {
  const archive = new ZipStream();

  // Define the function that will do the job
  // This function is deliberately not awaited so we can return the stream to the client
  // while this function executes on the side and pushes data in the stream
  void (async () => {
    const addEntry = promisify(archive.entry.bind(archive));
    try {
      for (const arg of callbackArgs) {
        const result = await callbackFnc(arg);
        await addEntry(result.content, { name: result.name });
      }
    } catch (err) {
      dependencies.logger.error(err, 'Problem occurred during archive streaming');
      archive.destroy(err as Error);
    }
    archive.finalize();
  })();

  return archive;
}
