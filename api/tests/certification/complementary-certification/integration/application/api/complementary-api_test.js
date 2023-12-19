import { getById } from '../../../../../../src/certification/complementary-certification/application/api/complementary-api.js';
import { catchErr, databaseBuilder, expect } from '../../../../../test-helper.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { ComplementaryCertification } from '../../../../../../src/certification/complementary-certification/application/api/models/ComplementaryCertification.js';

describe('Integration | Application | Certification | ComplementaryCertification | API', function () {
  context('#getById', function () {
    context('when no id is provided', function () {
      it('should return an error', async function () {
        // given, when
        const error = await catchErr(getById)({});
        // then
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('Complementary certification id parameter is mandatory');
      });
    });

    context('when a complementary certification does not exist', function () {
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

    context('when complementary certification requested exists', function () {
      it('should return the complementary certification DTO', async function () {
        // given
        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
        await databaseBuilder.commit();

        // when
        const result = await getById(complementaryCertification.id);

        // then
        expect(new ComplementaryCertification(complementaryCertification)).to.deep.equal(result);
      });
    });
  });
});
