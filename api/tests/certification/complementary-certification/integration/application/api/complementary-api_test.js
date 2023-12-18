import { getById } from '../../../../../../src/certification/complementary-certification/application/api/complementary-api.js';
import { catchErr, expect } from '../../../../../test-helper.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';

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

    context('when an unexisting complementary certification', function () {
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
  });
});
