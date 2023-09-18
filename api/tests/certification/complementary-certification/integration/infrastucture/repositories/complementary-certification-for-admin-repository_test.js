import { databaseBuilder, domainBuilder, expect, catchErr } from '../../../../../test-helper.js';
import * as complementaryCertificationForAdminRepository from '../../../../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-for-admin-repository.js';
import { NotFoundError } from '../../../../../../lib/domain/errors.js';

describe('Integration | Repository | complementary-certification-for-admin-repository', function () {
  describe('#getById', function () {
    it('should return the complementary certification by its id', async function () {
      // given
      const complementaryCertificationId = 1;
      databaseBuilder.factory.buildComplementaryCertification({
        id: complementaryCertificationId,
        label: 'Pix+ Édu 1er degré',
        hasExternalJury: true,
      });

      await databaseBuilder.commit();

      // when
      const complementaryCertification = await complementaryCertificationForAdminRepository.getById({
        complementaryCertificationId,
      });

      // then
      const expectedComplementaryCertification = domainBuilder.buildComplementaryCertificationForAdmin({
        id: 1,
        label: 'Pix+ Édu 1er degré',
        hasExternalJury: true,
      });
      expect(complementaryCertification).to.deep.equal(expectedComplementaryCertification);
    });

    describe('when complementary certification does not exist', function () {
      it('should return a NotFoundError', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          label: 'Pix+ Édu 1er degré',
          hasExternalJury: true,
        });

        await databaseBuilder.commit();

        // when
        const error = await catchErr(complementaryCertificationForAdminRepository.getById)({
          complementaryCertificationId: 2,
        });

        // then
        expect(error).to.deepEqualInstance(new NotFoundError('The complementary certification does not exist'));
      });
    });
  });
});
