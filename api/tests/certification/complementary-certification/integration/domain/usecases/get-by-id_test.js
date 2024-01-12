import { catchErr, expect, databaseBuilder, domainBuilder } from '../../../../../test-helper.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { getById } from '../../../../../../src/certification/complementary-certification/domain/usecases/get-by-id.js';
import * as complementaryCertificationRepository from '../../../../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-repository.js';

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
      const complementaryCertificationId = 999999;
      databaseBuilder.factory.buildComplementaryCertification({
        id: complementaryCertificationId,
      });
      await databaseBuilder.commit();

      // when
      const complementaryCertification = await getById({
        id: complementaryCertificationId,
        complementaryCertificationRepository,
      });

      // then
      const expectedComplementaryCertification = domainBuilder.buildComplementaryCertification({
        id: complementaryCertificationId,
        label: 'UneSuperCertifComplémentaire',
        key: 'DROIT',
      });
      expect(complementaryCertification).to.deep.equal(expectedComplementaryCertification);
    });
  });
});
