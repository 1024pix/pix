const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const pixPlusDroitMaitreCertificationResultRepository = require('../../../../lib/infrastructure/repositories/pix-plus-droit-maitre-certification-result-repository');
const { PIX_DROIT_MAITRE_CERTIF } = require('../../../../lib/domain/models/Badge').keys;

describe('Integration | Infrastructure | Repositories | pix-plus-droit-maitre-certification-result-repository', function () {
  describe('#get', function () {
    context('when there is no pix plus droit maitre certification result for a given certification id', function () {
      it('should return a not_taken result', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
        await databaseBuilder.commit();

        // when
        const pixPlusCertificationResult = await pixPlusDroitMaitreCertificationResultRepository.get({
          certificationCourseId,
        });

        // then
        const expectedPixPlusCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();
        expect(pixPlusCertificationResult).to.deepEqualInstance(expectedPixPlusCertificationResult);
      });
    });

    context(
      'when there is a acquired pix plus droit maitre certification result for a given certification id',
      function () {
        it('should return a acquired result', async function () {
          // given
          databaseBuilder.factory.buildBadge({ key: PIX_DROIT_MAITRE_CERTIF });
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
          databaseBuilder.factory.buildComplementaryCertificationCourseResult({
            certificationCourseId,
            partnerKey: PIX_DROIT_MAITRE_CERTIF,
            acquired: true,
          });
          await databaseBuilder.commit();

          // when
          const pixPlusCertificationResult = await pixPlusDroitMaitreCertificationResultRepository.get({
            certificationCourseId,
          });

          // then
          const expectedPixPlusCertificationResult =
            domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();
          expect(pixPlusCertificationResult).to.deepEqualInstance(expectedPixPlusCertificationResult);
        });
      }
    );

    context(
      'when there is a rejected pix plus droit maitre certification result for a given certification id',
      function () {
        it('should return a rejected result', async function () {
          // given
          databaseBuilder.factory.buildBadge({ key: PIX_DROIT_MAITRE_CERTIF });
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
          databaseBuilder.factory.buildComplementaryCertificationCourseResult({
            certificationCourseId,
            partnerKey: PIX_DROIT_MAITRE_CERTIF,
            acquired: false,
          });
          await databaseBuilder.commit();

          // when
          const pixPlusCertificationResult = await pixPlusDroitMaitreCertificationResultRepository.get({
            certificationCourseId,
          });

          // then
          const expectedPixPlusCertificationResult =
            domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
          expect(pixPlusCertificationResult).to.deepEqualInstance(expectedPixPlusCertificationResult);
        });
      }
    );
  });
});
