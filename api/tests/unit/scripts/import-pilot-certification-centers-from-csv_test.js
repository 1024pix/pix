import { buildCertificationCentersPilotsList } from '../../../scripts/certification/import-pilot-certification-centers-from-csv.js';
import { expect } from '../../test-helper.js';

describe('Unit | Scripts | import-pilot-certification-centers-from-csv', function () {
  describe('#buildCertificationCentersPilotsList', function () {
    it('should return the certification center id and the feature id', function () {
      const featureId = 1006;
      const certificationCenterId1 = 1234;
      const certificationCenterId2 = 5678;

      const csvData = [
        { certification_center_id: certificationCenterId1 },
        { certification_center_id: certificationCenterId2 },
      ];

      // when
      const certificationCentersPilotsList = buildCertificationCentersPilotsList({ featureId, csvData });

      // then
      expect(certificationCentersPilotsList).to.deep.equal([
        { certificationCenterId: certificationCenterId1, featureId },
        { certificationCenterId: certificationCenterId2, featureId },
      ]);
    });
  });
});
