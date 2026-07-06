import { generateCSVTemplate } from '../../../../../../src/shared/infrastructure/serializers/csv/csv-template.js';
import { expect } from '../../../../../test-helper.js';

const BOM_CHAR = '\ufeff';

describe('Unit | Serializer | CSV | csv-template', function () {
  describe('#generateCSVTemplate', function () {
    it('should return template with columns', async function () {
      const template = await generateCSVTemplate(['Column1', 'Column2']);

      expect(template).to.equal(`${BOM_CHAR}"Column1";"Column2"`);
    });
  });
});
