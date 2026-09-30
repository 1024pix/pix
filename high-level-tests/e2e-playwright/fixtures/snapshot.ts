import { glob, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { expect, test as base } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import { PDFParse } from 'pdf-parse';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export const snapshotFixtures = base.extend<{
  globalTestId: string;
  forEachTest: void;
  snapshotHandler: SnapshotHandler;
}>({
  // eslint-disable-next-line no-empty-pattern
  snapshotHandler: async ({}, use) => {
    await use(new SnapshotHandler({ shouldUpdateSnapshots: process.env.UPDATE_SNAPSHOTS === 'true' }));
  },
});

class SnapshotHandler {
  private readonly results: { label: string; value: number | string | null }[];
  private readonly shouldUpdateSnapshots: boolean;
  constructor({ shouldUpdateSnapshots }: { shouldUpdateSnapshots: boolean }) {
    this.results = [];
    this.shouldUpdateSnapshots = shouldUpdateSnapshots;
  }

  push(label: string, value: number | string | null) {
    this.results.push({ label, value });
  }

  async expectOrRecord(fileName: string) {
    const resultDir = path.resolve(import.meta.dirname, '../snapshots');
    const resultFilePath = path.join(resultDir, fileName as string);
    if (this.shouldUpdateSnapshots) {
      await mkdir(path.dirname(resultFilePath), { recursive: true });
      await writeFile(resultFilePath, JSON.stringify(this.results));
    } else {
      const data = await readFile(resultFilePath, { encoding: 'utf-8' });
      const expectedResults = JSON.parse(data);
      expect(this.results.length).toBe(expectedResults.length);
      for (let i = 0; i < this.results.length; ++i) {
        expect(this.results[i]).toStrictEqual(expectedResults[i]);
      }
    }
  }

  async comparePdfOrRecord(pdfBuffer: Buffer, baseFileName: string) {
    const resultDir = path.resolve(import.meta.dirname, '../snapshots');
    const resultFilePath = path.join(resultDir, baseFileName as string);
    const currentPNGs = await this.#convertPDFIntoPNGs(pdfBuffer);
    if (this.shouldUpdateSnapshots) {
      for (const [index, currentPNG] of currentPNGs.entries()) {
        await mkdir(path.dirname(resultFilePath), { recursive: true });
        await writeFile(resultFilePath + `_page${index}.png`, currentPNG);
      }
    } else {
      const referencePngFilenames = await this.#getAllPNGFilenames(resultFilePath);
      expect(referencePngFilenames.length).toBe(currentPNGs.length);

      for (let i = 0; i < referencePngFilenames.length; i++) {
        const referencePngFilename = referencePngFilenames[i];
        const currentPNGData = currentPNGs[i];
        const referencePngDecoded = PNG.sync.read(await readFile(referencePngFilename));
        const currentPNGDecoded = PNG.sync.read(Buffer.from(currentPNGData));
        expect(currentPNGDecoded.width).toBe(referencePngDecoded.width);
        expect(currentPNGDecoded.height).toBe(referencePngDecoded.height);

        const { width, height } = referencePngDecoded;
        const diff = new PNG({ width, height });
        const diffPixels = pixelmatch(currentPNGDecoded.data, referencePngDecoded.data, diff.data, width, height, {
          threshold: 0.1,
          includeAA: false,
        });
        if (i === 0) {
          // page 0 : données dynamiques (code de vérification et date de délivrance)
          const diffRatio = diffPixels / (width * height);
          expect(diffRatio).toBeLessThan(0.0015); // < 0.15% pixels différents
        } else {
          // pages suivantes : contenu statique, correspondance exacte attendue
          expect(diffPixels).toBe(0);
        }
      }
    }
  }

  async compareCsvOrRecord(csvBuffer: Buffer, fileName: string, ignoredColumns: string[] = []) {
    const resultDir = path.resolve(import.meta.dirname, '../snapshots');
    const resultFilePath = path.join(resultDir, fileName as string);
    const parsedCsvData = parse(csvBuffer.toString('utf-8'), {
      columns: true,
      delimiter: ';',
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }) as Record<string, unknown>[];
    for (const ignoredColumn of ignoredColumns) {
      for (const row of parsedCsvData) {
        delete row[ignoredColumn];
      }
    }
    if (this.shouldUpdateSnapshots) {
      await mkdir(path.dirname(resultFilePath), { recursive: true });
      await writeFile(resultFilePath, JSON.stringify(parsedCsvData));
    } else {
      const refData = JSON.parse(await readFile(resultFilePath, 'utf8'));
      expect(parsedCsvData).toEqual(refData);
    }
  }

  async #convertPDFIntoPNGs(buffer: Buffer) {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getScreenshot({ scale: 1 });
    await parser.destroy();
    return result.pages.map((page) => page.data);
  }

  async #getAllPNGFilenames(basePath: string) {
    const referencePngFilenames = [];
    const filenamesIter = glob(basePath + '*.png');
    for await (const filename of filenamesIter) {
      referencePngFilenames.push(filename);
    }
    referencePngFilenames.sort();
    return referencePngFilenames;
  }
}
