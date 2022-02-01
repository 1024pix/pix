const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const complementaryCertificationRepository = require('../../../../lib/infrastructure/repositories/complementary-certification-repository');

describe('Integration | Repository | complementary-certification-repository', function () {
  describe('#findAll', function () {
    describe('when there are complementary certifications', function () {
      it('should return all complementary certifications ordered by id', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          name: 'Pix+Edu',
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 2,
          name: 'Pix+Droit',
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 3,
          name: 'CléA Numérique',
        });

        await databaseBuilder.commit();

        // when
        const complementaryCertifications = await complementaryCertificationRepository.findAll();

        // then
        const expectedComplementaryCertifications = [
          domainBuilder.buildComplementaryCertification({
            id: 1,
            name: 'Pix+Edu',
          }),
          domainBuilder.buildComplementaryCertification({
            id: 2,
            name: 'Pix+Droit',
          }),
          domainBuilder.buildComplementaryCertification({
            id: 3,
            name: 'CléA Numérique',
          }),
        ];

        expect(complementaryCertifications).to.deepEqualArray(expectedComplementaryCertifications);
      });
    });

    describe('when there are no complementary certifications', function () {
      it('should return an empty array', async function () {
        // given when
        const complementaryCertifications = await complementaryCertificationRepository.findAll();

        // then
        expect(complementaryCertifications).to.be.empty;
      });
    });
  });
});
