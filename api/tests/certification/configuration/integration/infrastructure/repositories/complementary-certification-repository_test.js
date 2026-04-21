import * as complementaryCertificationRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/complementary-certification-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

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
          hasComplementaryReferential: false,
        });

        await databaseBuilder.commit();

        // when
        const complementaryCertifications = await complementaryCertificationRepository.findAll();

        // then
        const expectedComplementaryCertifications = [
          domainBuilder.certification.complementaryCertification.buildComplementaryCertification({
            id: 1,
            key: 'EDU_1ER_DEGRE',
            label: 'Pix+ Édu 1er degré',
          }),
          domainBuilder.certification.complementaryCertification.buildComplementaryCertification({
            id: 2,
            key: 'EDU_2ND_DEGRE',
            label: 'Pix+ Édu 2nd degré',
          }),
          domainBuilder.certification.complementaryCertification.buildComplementaryCertification({
            id: 3,
            key: 'DROIT',
            label: 'Pix+ Droit',
          }),
          domainBuilder.certification.complementaryCertification.buildComplementaryCertification({
            id: 4,
            key: 'CLEA',
            label: 'CléA Numérique',
            hasComplementaryReferential: false,
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

  describe('#getByKey', function () {
    context('when the complementary certification does not exist', function () {
      it('should throw a NotFoundError', async function () {
        // given
        const unknownComplementaryCertificationKey = 'UNKNOWN_KEY';

        // when
        const error = await catchErr(complementaryCertificationRepository.getByKey)(
          unknownComplementaryCertificationKey,
        );

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('Complementary certification does not exist');
      });
    });

    it('should return the complementary certification by its key', async function () {
      // given
      const keyToSearch = 'EDU_1ER_DEGRE';
      const expectedComplementaryCertification =
        domainBuilder.certification.complementaryCertification.buildComplementaryCertification({
          id: 1,
          key: keyToSearch,
        });
      databaseBuilder.factory.buildComplementaryCertification(expectedComplementaryCertification);

      databaseBuilder.factory.buildComplementaryCertification({
        id: 3,
        key: 'EDU_2ND_DEGRE',
      });

      await databaseBuilder.commit();

      // when
      const complementaryCertification = await complementaryCertificationRepository.getByKey(keyToSearch);

      // then
      expect(complementaryCertification).to.deep.equal(expectedComplementaryCertification);
    });
  });

  describe('#getById', function () {
    context('when the complementary certification does not exist', function () {
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
      const expectedComplementaryCertification =
        domainBuilder.certification.complementaryCertification.buildComplementaryCertification({
          id: complementaryCertificationId,
          key: 'EDU_1ER_DEGRE',
          label: 'Pix+ Édu 1er degré',
        });
      expect(result).to.deep.equal(expectedComplementaryCertification);
    });
  });
});
