const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const pixPlusDroitExpertCertificationResultRepository = require('../../../../lib/infrastructure/repositories/pix-plus-droit-expert-certification-result-repository');
const { PIX_DROIT_EXPERT_CERTIF } = require('../../../../lib/domain/models/Badge').keys;

describe('Integration | Infrastructure | Repositories | pix-plus-droit-expert-certification-result-repository', function () {
  describe('#get', function () {
    context('when there is no pix plus droit expert certification result for a given certification id', function () {
      it('should return a not_taken result', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
        await databaseBuilder.commit();

        // when
        const pixPlusCertificationResult = await pixPlusDroitExpertCertificationResultRepository.get({
          certificationCourseId,
        });

        // then
        const expectedPixPlusCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();
        expect(pixPlusCertificationResult).to.deepEqualInstance(expectedPixPlusCertificationResult);
      });
    });

    context(
      'when there is a acquired pix plus droit expert certification result for a given certification id',
      function () {
        it('should return a acquired result', async function () {
          // given
          databaseBuilder.factory.buildBadge({ key: PIX_DROIT_EXPERT_CERTIF });
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
          databaseBuilder.factory.buildComplementaryCertificationCourseResult({
            certificationCourseId,
            partnerKey: PIX_DROIT_EXPERT_CERTIF,
            acquired: true,
          });
          await databaseBuilder.commit();

          // when
          const pixPlusCertificationResult = await pixPlusDroitExpertCertificationResultRepository.get({
            certificationCourseId,
          });

          // then
          const expectedPixPlusCertificationResult =
            domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();
          expect(pixPlusCertificationResult).to.deepEqualInstance(expectedPixPlusCertificationResult);
        });
      }
    );

    context(
      'when there is a rejected pix plus droit expert certification result for a given certification id',
      function () {
        it('should return a rejected result', async function () {
          // given
          databaseBuilder.factory.buildBadge({ key: PIX_DROIT_EXPERT_CERTIF });
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
          databaseBuilder.factory.buildComplementaryCertificationCourseResult({
            certificationCourseId,
            partnerKey: PIX_DROIT_EXPERT_CERTIF,
            acquired: false,
          });
          await databaseBuilder.commit();

          // when
          const pixPlusCertificationResult = await pixPlusDroitExpertCertificationResultRepository.get({
            certificationCourseId,
          });

          // then
          const expectedPixPlusCertificationResult =
            domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();
          expect(pixPlusCertificationResult).to.deepEqualInstance(expectedPixPlusCertificationResult);
        });
      }
    );
  });
});
