import * as fs from 'fs/promises';
import * as path from 'path';

const shouldRecordHAR = process.env.RECORD_HAR === 'true';
const HAR_DIR = path.resolve(import.meta.dirname, './.har-record');

export default async () => {
  if (shouldRecordHAR) {
    try {
      const finalFilename = 'final.har';
      const files = (await fs.readdir(HAR_DIR)).filter((file) => path.extname(file) === '.har' && file !== 'final.har');

      if (files.length === 0) {
        console.log('No HAR files found !');
        return;
      }

      const harContents = await Promise.all(
        files.map(async (file) => {
          const content = await fs.readFile(path.join(HAR_DIR, file), 'utf-8');
          return JSON.parse(content);
        }),
      );

      const baseHar = harContents[0];
      for (let i = 1; i < harContents.length; i++) {
        baseHar.log.entries.push(...harContents[i].log.entries);
      }

      baseHar.log.entries = baseHar.log.entries.filter((entry: { request: { url: string } }) =>
        entry.request.url.includes(`localhost:${process.env.PIX_API_PORT}`),
      );

      baseHar.log.entries.sort(
        (a: { startedDateTime: string | number | Date }, b: { startedDateTime: string | number | Date }) =>
          new Date(a.startedDateTime).getTime() - new Date(b.startedDateTime).getTime(),
      );

      const finalHarFilePath = path.join(HAR_DIR, finalFilename);
      await fs.writeFile(HAR_DIR + '/' + finalFilename, JSON.stringify(baseHar, null, 2), 'utf-8');
      console.log(`Merged and filtered HAR written to ${finalHarFilePath}`);

      await Promise.all(files.map((file) => fs.unlink(path.join(HAR_DIR, file))));
    } catch (error) {
      console.error('Error merging HAR files:', error);
    }
  }
};
