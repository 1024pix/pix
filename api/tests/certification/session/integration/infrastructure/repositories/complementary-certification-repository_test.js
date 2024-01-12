import { expect, databaseBuilder, catchErr } from '../../../../../test-helper.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { sessionRepositories } from '../../../../../../src/certification/session/infrastructure/repositories/index.js';
import { ComplementaryCertification } from '../../../../../../src/certification/session/domain/models/ComplementaryCertification.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';

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
      const complementaryCertification = await sessionRepositories.complementaryCertificationRepository.getById({
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
        const error = await catchErr(sessionRepositories.complementaryCertificationRepository.getById)({
          complementaryCertificationId: -1,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.deep.equal('Complementary certification does not exist');
      });
    });
  });
});
