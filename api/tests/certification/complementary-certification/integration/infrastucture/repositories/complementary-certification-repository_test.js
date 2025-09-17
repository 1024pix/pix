import * as complementaryCertificationRepository from '../../../../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Certification | Repository | complementary-certification-repository', function () {
  describe('#findAll', function () {
    describe('when there are complementary certifications', function () {
      it('should return all complementary certifications ordered by id', async function () {
        // given
        const edu1Complementary = databaseBuilder.factory.buildComplementaryCertification.pixEdu1erDegre({ id: 1 });
        const edu2Complementary = databaseBuilder.factory.buildComplementaryCertification.pixEdu2ndDegre({ id: 2 });
        const droitComplementary = databaseBuilder.factory.buildComplementaryCertification.droit({ id: 3 });
        const cleaComplementary = databaseBuilder.factory.buildComplementaryCertification.clea({ id: 4 });

        await databaseBuilder.commit();

        // when
        const complementaryCertifications = await complementaryCertificationRepository.findAll();

        // then
        const expectedComplementaryCertifications = [
          domainBuilder.certification.complementaryCertification.buildComplementaryCertification({
            ...edu1Complementary,
          }),
          domainBuilder.certification.complementaryCertification.buildComplementaryCertification({
            ...edu2Complementary,
          }),
          domainBuilder.certification.complementaryCertification.buildComplementaryCertification({
            ...droitComplementary,
          }),
          domainBuilder.certification.complementaryCertification.buildComplementaryCertification({
            ...cleaComplementary,
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
    context('when the complementary certification does not exist', function () {
      it('should throw a NotFoundError', async function () {
        // given
        const unknownComplementaryCertificationLabel = 'a label';

        // when
        const error = await catchErr(complementaryCertificationRepository.getByLabel)({
          label: unknownComplementaryCertificationLabel,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('Complementary certification does not exist');
      });
    });

    it('should return the complementary certification by its label', async function () {
      // given
      const edu1Complementary = databaseBuilder.factory.buildComplementaryCertification.pixEdu1erDegre({ id: 1 });

      databaseBuilder.factory.buildComplementaryCertification.pixEdu2ndDegre({
        id: 3,
      });

      await databaseBuilder.commit();

      // when
      const complementaryCertification = await complementaryCertificationRepository.getByLabel({
        label: edu1Complementary.label,
      });

      // then
      const expectedComplementaryCertification =
        domainBuilder.certification.complementaryCertification.buildComplementaryCertification({
          ...edu1Complementary,
        });
      expect(complementaryCertification).to.deep.equal(expectedComplementaryCertification);
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
      const edu1Complementary = databaseBuilder.factory.buildComplementaryCertification.pixEdu1erDegre({ id: 1 });

      await databaseBuilder.commit();

      // when
      const result = await complementaryCertificationRepository.getById({
        id: edu1Complementary.id,
      });

      // then
      const expectedComplementaryCertification =
        domainBuilder.certification.complementaryCertification.buildComplementaryCertification({
          ...edu1Complementary,
        });
      expect(result).to.deep.equal(expectedComplementaryCertification);
    });
  });
});
