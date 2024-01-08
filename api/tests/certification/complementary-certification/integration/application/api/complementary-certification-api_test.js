import { getById } from '../../../../../../src/certification/complementary-certification/application/api/complementary-certification-api.js';
import { catchErr, databaseBuilder, expect } from '../../../../../test-helper.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { ComplementaryCertification } from '../../../../../../src/certification/complementary-certification/application/api/models/ComplementaryCertification.js';

describe('Integration | Application | Certification | ComplementaryCertification | API', function () {
  context('#getById', function () {
    context('when an unexisting complementary certification id is provided', function () {
      it('should return an error', async function () {
        // given
        const unknowComplementaryCertification = 9999;

        // when
        const error = await catchErr(getById)({ id: unknowComplementaryCertification });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('Complementary certification does not exist');
      });
    });

    context('when an existing complementary certification id is provided', function () {
      it('should return a complementary certification', async function () {
        // given
        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          id: 123,
          key: 'key',
          label: 'LABEL',
        });

        await databaseBuilder.commit();

        // when
        const result = await getById({ id: 123 });

        // then
        expect(result).to.deepEqualInstance(new ComplementaryCertification(complementaryCertification));
      });
    });
  });
});
