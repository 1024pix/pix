import { expect } from 'chai';
import JSZip from 'jszip';

import { createZipStream } from '../../../../../../src/shared/infrastructure/utils/zip/create-zip-sream.ts';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Utils | Zip | getMultipleFilesAsZip', function () {
  describe('#createZipStream', function () {
    it('should return a streamable zip', async function () {
      // given
      let i = 0;
      const func = async ({ a, b }) => {
        const res = {
          name: `fichier-${i}`,
          content: `${a + b}`,
        };
        i++;
        return res;
      };
      const args = [
        { a: 1, b: 2 },
        { a: 2, b: 2 },
      ];

      // when
      const zipStream = createZipStream(func, args);
      const data = await streamToPromise(zipStream);

      // then
      const expectedNames = [];
      const expectedContents = [];

      const zip = await JSZip.loadAsync(data);
      zip.forEach((_, file) => {
        expectedNames.push(file.name);
      });
      for (const fileName of expectedNames) {
        const content = await zip.file(fileName).async('string');
        expectedContents.push(content);
      }
      expect(expectedNames).to.deep.equal(['fichier-0', 'fichier-1']);
      expect(expectedContents).to.deep.equal(['3', '4']);
    });
  });
});

export async function streamToPromise(stream) {
  return streamToPromiseArray(stream).then((array) => {
    return array.join('');
  });
}

export function streamToPromiseArray(stream) {
  return new Promise((resolve, reject) => {
    const result = [];
    stream.on('data', (data) => {
      result.push(data);
    });
    stream.on('end', () => {
      resolve(result);
    });
    stream.on('error', reject);
  });
}
