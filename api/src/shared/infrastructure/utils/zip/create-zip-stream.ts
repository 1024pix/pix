import { PassThrough, pipeline } from 'node:stream';
import { promisify } from 'node:util';

import ZipStream from 'zip-stream';

import { logger } from '../logger.js';

type Result = {
  filename: string;
  content: Buffer | string;
};

type LoggerType = typeof logger;

type Deps = {
  logger: LoggerType;
};

export function createZipStream<T>({
  callbackFnc,
  callbackArgs,
  allowedErrs = [],
  dependencies,
}: {
  callbackFnc: (arg: T) => Promise<Result>;
  callbackArgs: Array<T>;
  allowedErrs: Array<Error>;
  dependencies: Deps;
}): PassThrough {
  const archive = new ZipStream();
  const output = new PassThrough();
  const allowedErrNames = allowedErrs.map((errClass) => errClass.name);

  pipeline(archive, output, (err) => {
    if (err) {
      dependencies.logger.error(err, 'Problem occurred during archive streaming');
    }
  });

  // Define the function that will do the job
  // This function is deliberately not awaited so we can return the stream to the client
  // while this function executes on the side and pushes data in the stream
  void (async () => {
    const addEntry = promisify(archive.entry.bind(archive));
    for (const arg of callbackArgs) {
      try {
        const result = await callbackFnc(arg);
        await addEntry(result.content, { name: result.filename });
      } catch (err) {
        const currentErrName = (err as object)?.constructor?.name;
        if (allowedErrNames.includes(currentErrName)) {
          continue;
        }
        archive.destroy(err as Error);
        return;
      }
    }
    archive.finalize();
  })();

  return output;
}
