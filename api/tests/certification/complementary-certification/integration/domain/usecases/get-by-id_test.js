import { getById } from '../../../../../../src/certification/complementary-certification/domain/usecases/get-by-id.js';
import * as complementaryCertificationRepository from '../../../../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Certification | Complementary | UseCase | get-by-id', function () {
  context('when there is no complementary certification', function () {
    it('should throw NotFoundError', async function () {
      // given
      const unknownComplementaryCertificationId = 999999;

      // when
      const error = await catchErr(getById)({
        id: unknownComplementaryCertificationId,
        complementaryCertificationRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Complementary certification does not exist');
    });
  });

  context('when there is a complementary certification', function () {
    it('should return the complementary certification', async function () {
      // given
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        id: 99999,
      });
      await databaseBuilder.commit();

      // when
      const result = await getById({
        id: complementaryCertification.id,
        complementaryCertificationRepository,
      });

      // then
      const expectedComplementaryCertification =
        domainBuilder.certification.complementaryCertification.buildComplementaryCertification({
          ...complementaryCertification,
        });
      expect(result).to.deep.equal(expectedComplementaryCertification);
    });
  });
});
