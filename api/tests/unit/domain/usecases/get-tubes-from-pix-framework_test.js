const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | get-tubes', function () {
  it('should get tubes from framework', async function () {
    // given
    const expectedResult = Symbol('tubes');

    const tubeRepository = {
      findActivesFromPixFramework: sinon.stub().resolves(expectedResult),
    };

    // when
    const response = await usecases.getTubesFromPixFramework({
      locale: 'fr',
      tubeRepository,
    });

    expect(response).to.equal(expectedResult);
    expect(tubeRepository.findActivesFromPixFramework).to.have.been.calledWithExactly('fr');
  });
});
