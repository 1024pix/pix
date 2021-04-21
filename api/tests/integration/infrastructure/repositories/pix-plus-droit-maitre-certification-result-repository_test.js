const { expect, databaseBuilder } = require('../../../test-helper');
const pixPlusDroitMaitreCertificationResultRepository = require('../../../../lib/infrastructure/repositories/pix-plus-droit-maitre-certification-result-repository');
const PixPlusDroitMaitreCertificationResult = require('../../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');

describe('Integration | Infrastructure | Repositories | pix-plus-droit-maitre-certification-result-repository', () => {

  describe('#get', () => {

    context('when there is no pix plus droit maitre certification result for a given certification id', () => {

      it('should return a not_taken result', async () => {
        // when
        const pixPlusCertificationResult = await pixPlusDroitMaitreCertificationResultRepository.get({ certificationCourseId: 123 });

        // then
        expect(pixPlusCertificationResult).to.be.instanceOf(PixPlusDroitMaitreCertificationResult);
        expect(pixPlusCertificationResult.status).to.equal(PixPlusDroitMaitreCertificationResult.statuses.NOT_TAKEN);
      });
    });

    context('when there is a acquired pix plus droit maitre certification result for a given certification id', () => {

      it('should return a acquired result', async () => {
        // given
        databaseBuilder.factory.buildBadge({ key: PixPlusDroitMaitreCertificationResult.badgeKey });
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: PixPlusDroitMaitreCertificationResult.badgeKey, acquired: true });
        await databaseBuilder.commit();

        // when
        const pixPlusCertificationResult = await pixPlusDroitMaitreCertificationResultRepository.get({ certificationCourseId });

        // then
        expect(pixPlusCertificationResult).to.be.instanceOf(PixPlusDroitMaitreCertificationResult);
        expect(pixPlusCertificationResult.status).to.equal(PixPlusDroitMaitreCertificationResult.statuses.ACQUIRED);
      });
    });

    context('when there is a rejected pix plus droit maitre certification result for a given certification id', () => {

      it('should return a rejected result', async () => {
        // given
        databaseBuilder.factory.buildBadge({ key: PixPlusDroitMaitreCertificationResult.badgeKey });
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: PixPlusDroitMaitreCertificationResult.badgeKey, acquired: false });
        await databaseBuilder.commit();

        // when
        const pixPlusCertificationResult = await pixPlusDroitMaitreCertificationResultRepository.get({ certificationCourseId });

        // then
        expect(pixPlusCertificationResult).to.be.instanceOf(PixPlusDroitMaitreCertificationResult);
        expect(pixPlusCertificationResult.status).to.equal(PixPlusDroitMaitreCertificationResult.statuses.REJECTED);
      });
    });
  });
});
