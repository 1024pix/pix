const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | get-pix-framework', function () {
  it('should get the pix framework', async function () {
    // given
    const expectedTubesResult = Symbol('tubes');
    const expectedThematicsResult = Symbol('thematic');
    const expectedAreasResult = Symbol('area');

    const tubeRepository = {
      findActivesFromPixFramework: sinon.stub().resolves(expectedTubesResult),
    };

    const thematicRepository = {
      list: sinon.stub().resolves().returns(expectedThematicsResult),
    };

    const areaRepository = {
      listWithPixCompetencesOnly: sinon.stub().resolves().returns(expectedAreasResult),
    };

    // when
    const response = await usecases.getPixFramework({
      locale: 'fr',
      tubeRepository,
      thematicRepository,
      areaRepository,
    });

    expect(response).to.deep.equal({
      tubes: expectedTubesResult,
      thematics: expectedThematicsResult,
      areas: expectedAreasResult,
    });
    expect(tubeRepository.findActivesFromPixFramework).to.have.been.calledWithExactly('fr');
  });
});
