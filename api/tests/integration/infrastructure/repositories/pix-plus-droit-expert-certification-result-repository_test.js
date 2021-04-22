const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const pixPlusDroitExpertCertificationResultRepository = require('../../../../lib/infrastructure/repositories/pix-plus-droit-expert-certification-result-repository');
const PixPlusDroitExpertCertificationResult = require('../../../../lib/domain/models/PixPlusDroitExpertCertificationResult');

describe('Integration | Infrastructure | Repositories | pix-plus-droit-expert-certification-result-repository', () => {

  describe('#get', () => {

    context('when there is no pix plus droit expert certification result for a given certification id', () => {

      it('should return a not_taken result', async () => {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
        await databaseBuilder.commit();

        // when
        const pixPlusCertificationResult = await pixPlusDroitExpertCertificationResultRepository.get({ certificationCourseId });

        // then
        const expectedPixPlusCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();
        expect(pixPlusCertificationResult).to.be.instanceOf(PixPlusDroitExpertCertificationResult);
        expect(pixPlusCertificationResult).to.deep.equal(expectedPixPlusCertificationResult);
      });
    });

    context('when there is a acquired pix plus droit expert certification result for a given certification id', () => {

      it('should return a acquired result', async () => {
        // given
        databaseBuilder.factory.buildBadge({ key: PixPlusDroitExpertCertificationResult.badgeKey });
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: PixPlusDroitExpertCertificationResult.badgeKey, acquired: true });
        await databaseBuilder.commit();

        // when
        const pixPlusCertificationResult = await pixPlusDroitExpertCertificationResultRepository.get({ certificationCourseId });

        // then
        const expectedPixPlusCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();
        expect(pixPlusCertificationResult).to.be.instanceOf(PixPlusDroitExpertCertificationResult);
        expect(pixPlusCertificationResult).to.deep.equal(expectedPixPlusCertificationResult);
      });
    });

    context('when there is a rejected pix plus droit expert certification result for a given certification id', () => {

      it('should return a rejected result', async () => {
        // given
        databaseBuilder.factory.buildBadge({ key: PixPlusDroitExpertCertificationResult.badgeKey });
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: PixPlusDroitExpertCertificationResult.badgeKey, acquired: false });
        await databaseBuilder.commit();

        // when
        const pixPlusCertificationResult = await pixPlusDroitExpertCertificationResultRepository.get({ certificationCourseId });

        // then
        const expectedPixPlusCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();
        expect(pixPlusCertificationResult).to.be.instanceOf(PixPlusDroitExpertCertificationResult);
        expect(pixPlusCertificationResult).to.deep.equal(expectedPixPlusCertificationResult);
      });
    });
  });
});
