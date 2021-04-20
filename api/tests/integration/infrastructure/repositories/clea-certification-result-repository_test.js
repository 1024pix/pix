const { expect, databaseBuilder } = require('../../../test-helper');
const cleaCertificationResultRepository = require('../../../../lib/infrastructure/repositories/clea-certification-result-repository');
const Badge = require('../../../../lib/domain/models/Badge');
const CleaCertificationResult = require('../../../../lib/domain/models/CleaCertificationResult');

describe('Integration | Infrastructure | Repositories | clea-certification-result-repository', () => {

  describe('#get', () => {

    context('when there is no clea certification result for a given certification id', () => {

      it('should return a not_passed result', async () => {
        // when
        const cleaCertificationResult = await cleaCertificationResultRepository.get(123);

        // then
        expect(cleaCertificationResult.status).to.equal(CleaCertificationResult.cleaStatuses.NOT_PASSED);
      });
    });

    context('when there is a clea certification result for a given certification id', () => {
      const certificationCourseRejectedCleaId = 1;
      const certificationCourseSuccessCleaId = 2;

      beforeEach(() => {
        const dbf = databaseBuilder.factory;
        dbf.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA });
        dbf.buildCertificationCourse({ id: certificationCourseRejectedCleaId });
        dbf.buildPartnerCertification({ certificationCourseId: certificationCourseRejectedCleaId, partnerKey: Badge.keys.PIX_EMPLOI_CLEA, acquired: false });

        dbf.buildCertificationCourse({ id: certificationCourseSuccessCleaId });
        dbf.buildPartnerCertification({ certificationCourseId: certificationCourseSuccessCleaId, partnerKey: Badge.keys.PIX_EMPLOI_CLEA, acquired: true });

        return databaseBuilder.commit();
      });

      it('when it\'s not acquired it should return rejected result', async () => {
        // when
        const cleaCertificationResult = await cleaCertificationResultRepository.get(certificationCourseRejectedCleaId);

        // then
        expect(cleaCertificationResult.status).to.equal(CleaCertificationResult.cleaStatuses.REJECTED);
      });

      it('when it\'s acquired it should return acquired result', async () => {
        // when
        const cleaCertificationResult = await cleaCertificationResultRepository.get(certificationCourseSuccessCleaId);

        // then
        expect(cleaCertificationResult.status).to.equal(CleaCertificationResult.cleaStatuses.ACQUIRED);
      });
    });
  });
});
