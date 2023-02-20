import { expect } from '../../test-helper';
import { prepareDataForInsert } from '../../../scripts/create-sco-certification-centers';

describe('Unit | Scripts | create-sco-certification-centers.js', function () {
  describe('#prepareDataForInsert', function () {
    it('should trim name and add SCO type', function () {
      // given
      const certificationCenters = [
        { name: '  Collège Victor Hugo   ', uai: '1234567a' },
        { name: '  Lycée Marie Curie     ', uai: '0123456b' },
      ];
      const expectedResult = [
        { name: 'Collège Victor Hugo', externalId: '1234567a', type: 'SCO' },
        { name: 'Lycée Marie Curie', externalId: '0123456b', type: 'SCO' },
      ];

      // when
      const result = prepareDataForInsert(certificationCenters);

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
