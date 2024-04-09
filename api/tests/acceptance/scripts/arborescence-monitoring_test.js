import * as Path from 'node:path';
import * as url from 'node:url';

import { countFilesInPath } from '../../../scripts/arborescence-monitoring/stats.js';
import { expect } from '../../test-helper.js';

describe('Acceptance | Scripts | arborescence-monitoring.js', function () {
  describe('#countFilesInPath', function () {
    it('should returns the number of files in mock-arborescence-monitoring directory', async function () {
      // given
      const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
      const path = Path.join(__dirname, './mock-arborescence-monitoring');

      // when
      const result = await countFilesInPath(path);

      // then
      expect(result).to.equal(6);
    });
  });
});
