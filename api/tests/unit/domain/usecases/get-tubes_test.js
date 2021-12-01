const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | get-tubes', function () {
  it('should get tubes', async function () {
    // given
    const expectedResult = Symbol('tubes');

    const tubeRepository = {
      list: sinon.stub().resolves(expectedResult),
    };

    // when
    const response = await usecases.getTubes({
      tubeRepository,
    });

    expect(response).to.equal(expectedResult);
  });
});
