import { getById } from '../../../../../../src/certification/complementary-certification/application/api/complementary-api.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';ComplementaryCertification.js';
describe('Unit | Application | Certification | ComplementaryCertification | API', function () {
  context('#getById', function () {
    context('when no id is provided', function () {
      it('should return an error', async function () {
        // given, when
        const error = catchErrSync(getById)({});
        // then
        expect(error.message).to.equal('Complementary certification id parameter is mandatory');
      });
    });
  });
});
