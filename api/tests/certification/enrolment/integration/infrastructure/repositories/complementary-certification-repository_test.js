import { enrolmentRepositories } from '../../../../../../src/certification/enrolment/infrastructure/repositories/index.js';
import { ComplementaryCertification } from '../../../../../../src/certification/session-management/domain/models/ComplementaryCertification.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Certification | Session | Repository | Complementary certification', function () {
  describe('#getById', function () {
    it('should fetch the complementary certification', async function () {
      // given
      const { id } = databaseBuilder.factory.buildComplementaryCertification({
        id: 1,
        label: 'UneSuperCertifComplémentaire',
        key: ComplementaryCertificationKeys.CLEA,
      });
      await databaseBuilder.commit();

      // when
      const complementaryCertification = await enrolmentRepositories.complementaryCertificationRepository.getById({
        complementaryCertificationId: id,
      });

      // then
      expect(complementaryCertification).to.deepEqualInstance(
        new ComplementaryCertification({
          id: 1,
          label: 'UneSuperCertifComplémentaire',
          key: ComplementaryCertificationKeys.CLEA,
        }),
      );
    });

    context('when there is no complementary certification for the given ID', function () {
      it('should return an error', async function () {
        // when
        const error = await catchErr(enrolmentRepositories.complementaryCertificationRepository.getById)({
          complementaryCertificationId: -1,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.deep.equal('Complementary certification does not exist');
      });
    });
  });

  describe('#getByLabel', function () {
    it('should fetch the complementary certification', async function () {
      // given
      const { label } = databaseBuilder.factory.buildComplementaryCertification({
        id: 1,
        label: 'UneSuperCertifComplémentaire',
        key: ComplementaryCertificationKeys.CLEA,
      });
      await databaseBuilder.commit();

      // when
      const complementaryCertification = await enrolmentRepositories.complementaryCertificationRepository.getByLabel({
        label,
      });

      // then
      expect(complementaryCertification).to.deepEqualInstance(
        new ComplementaryCertification({
          id: 1,
          label: 'UneSuperCertifComplémentaire',
          key: ComplementaryCertificationKeys.CLEA,
        }),
      );
    });

    context('when there is no complementary certification for the given label', function () {
      it('should return an error', async function () {
        // when
        const error = await catchErr(enrolmentRepositories.complementaryCertificationRepository.getByLabel)({
          label: 'a label',
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.deep.equal('Complementary certification does not exist');
      });
    });
  });

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
        const complementaryCertifications = await enrolmentRepositories.complementaryCertificationRepository.findAll();

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
        const complementaryCertifications = await enrolmentRepositories.complementaryCertificationRepository.findAll();

        // then
        expect(complementaryCertifications).to.be.empty;
      });
    });
  });
});
