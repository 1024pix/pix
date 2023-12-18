import { databaseBuilder, domainBuilder, expect, catchErr } from '../../../../../test-helper.js';
import * as complementaryCertificationRepository from '../../../../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';

describe('Integration | Certification | Repository | complementary-certification-repository', function () {
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

    describe('when there are no complementary certification', function () {
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

  describe('#getById', function () {
    context('when the complementary certification does not exists', function () {
      it('should throw a NotFoundError', async function () {
        // given
        const unknownComplementaryCertificationId = 1;

        // when
        const error = await catchErr(complementaryCertificationRepository.getById)({
          id: unknownComplementaryCertificationId,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('Complementary certification does not exist');
      });
    });

    it('should return the complementary certification by its id', async function () {
      // given
      const complementaryCertificationId = 1;
      databaseBuilder.factory.buildComplementaryCertification({
        id: complementaryCertificationId,
        key: 'EDU_1ER_DEGRE',
        label: 'Pix+ Édu 1er degré',
      });

      await databaseBuilder.commit();

      // when
      const result = await complementaryCertificationRepository.getById({
        id: complementaryCertificationId,
      });

      // then
      const expectedComplementaryCertification = domainBuilder.buildComplementaryCertification({
        id: complementaryCertificationId,
        key: 'EDU_1ER_DEGRE',
        label: 'Pix+ Édu 1er degré',
      });
      expect(result).to.deep.equal(expectedComplementaryCertification);
    });
  });
});
