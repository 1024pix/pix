const { expect, databaseBuilder } = require('../../../test-helper');
const cleaCertificationStatusRepository = require('../../../../lib/infrastructure/repositories/clea-certification-status-repository');
const Badge = require('../../../../lib/domain/models/Badge');

describe('Integration | Infrastructure | Repositories | clea-certification-status-repository', () => {

  describe('#getCleaCertificationStatus', () => {
    const certificationCourseRejectedCleaId = 1;
    const certificationCourseSuccessCleaId = 2;

    context('when there is no clea certification for a given certification id', () => {

      it('should return not_passed', async () => {

        // when
        const status = await cleaCertificationStatusRepository.getCleaCertificationStatus(certificationCourseRejectedCleaId);

        // then
        expect(status).to.equal(cleaCertificationStatusRepository.statuses.NOT_PASSED);
      });
    });

    context('when there is a clea certification for a given certification id', () => {

      beforeEach(() => {
        const dbf = databaseBuilder.factory;
        dbf.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA });
        dbf.buildCertificationCourse({ id: certificationCourseRejectedCleaId });
        dbf.buildPartnerCertification({ certificationCourseId: certificationCourseRejectedCleaId, partnerKey: Badge.keys.PIX_EMPLOI_CLEA, acquired: false });

        dbf.buildCertificationCourse({ id: certificationCourseSuccessCleaId });
        dbf.buildPartnerCertification({ certificationCourseId: certificationCourseSuccessCleaId, partnerKey: Badge.keys.PIX_EMPLOI_CLEA, acquired: true });

        return databaseBuilder.commit();
      });

      it('when it\'s not acquired it should return rejected', async () => {

        // when
        const status = await cleaCertificationStatusRepository.getCleaCertificationStatus(certificationCourseRejectedCleaId);

        // then
        expect(status).to.equal(cleaCertificationStatusRepository.statuses.REJECTED);
      });

      it('when it\'s acquired it should return acquired', async () => {

        // when
        const status = await cleaCertificationStatusRepository.getCleaCertificationStatus(certificationCourseSuccessCleaId);

        // then
        expect(status).to.equal(cleaCertificationStatusRepository.statuses.ACQUIRED);
      });
    });
  });
});
