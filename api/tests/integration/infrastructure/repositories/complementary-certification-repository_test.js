import { expect, databaseBuilder, domainBuilder } from '../../../test-helper';
import complementaryCertificationRepository from '../../../../lib/infrastructure/repositories/complementary-certification-repository';

describe('Integration | Repository | complementary-certification-repository', function () {
  describe('#findAll', function () {
    describe('when there are complementary certifications', function () {
      it('should return all complementary certifications ordered by id', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          key: 'EDU_1ER_DEGRE',
          label: 'Pix+ Édu 1er degré',
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 2,
          key: 'EDU_2ND_DEGRE',
          label: 'Pix+ Édu 2nd degré',
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 3,
          key: 'DROIT',
          label: 'Pix+ Droit',
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 4,
          key: 'CLEA',
          label: 'CléA Numérique',
        });

        await databaseBuilder.commit();

        // when
        const complementaryCertifications = await complementaryCertificationRepository.findAll();

        // then
        const expectedComplementaryCertifications = [
          domainBuilder.buildComplementaryCertification({
            id: 1,
            key: 'EDU_1ER_DEGRE',
            label: 'Pix+ Édu 1er degré',
          }),
          domainBuilder.buildComplementaryCertification({
            id: 2,
            key: 'EDU_2ND_DEGRE',
            label: 'Pix+ Édu 2nd degré',
          }),
          domainBuilder.buildComplementaryCertification({
            id: 3,
            key: 'DROIT',
            label: 'Pix+ Droit',
          }),
          domainBuilder.buildComplementaryCertification({
            id: 4,
            key: 'CLEA',
            label: 'CléA Numérique',
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

  describe('#getByLabel', function () {
    it('should return the complementary certification by its label', async function () {
      // given
      const label = 'Pix+ Édu 1er degré';
      databaseBuilder.factory.buildComplementaryCertification({
        id: 1,
        key: 'EDU_1ER_DEGRE',
        label,
      });

      databaseBuilder.factory.buildComplementaryCertification({
        id: 3,
        key: 'EDU_2ND_DEGRE',
        label: 'Pix+ Édu 2nd degré',
      });

      await databaseBuilder.commit();

      // when
      const complementaryCertification = await complementaryCertificationRepository.getByLabel({ label });

      // then
      const expectedComplementaryCertification = domainBuilder.buildComplementaryCertification({
        id: 1,
        key: 'EDU_1ER_DEGRE',
        label: 'Pix+ Édu 1er degré',
      });
      expect(complementaryCertification).to.deep.equal(expectedComplementaryCertification);
    });
  });
});
