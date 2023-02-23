const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases/index.js');

describe('Unit | UseCase | get-framework-areas', function () {
  let expectedTubesResult,
    expectedThematicsResult,
    expectedAreasResult,
    tubeRepository,
    thematicRepository,
    areaRepository,
    frameworkRepository,
    expectedFrameworkResult;

  beforeEach(function () {
    expectedTubesResult = [{ id: 'tubeId1', isMobileCompliant: false, isTabletCompliant: true }];
    expectedThematicsResult = [{ id: 'thematicId', tubeIds: ['tubeId1'] }];
    expectedAreasResult = [{ id: 'areaId1', competences: [{ id: 'competenceId1' }] }];
    expectedFrameworkResult = { id: 'frameworkId', name: 'framework' };

    const tubesFromRepository = [{ id: 'tubeId1', isMobileCompliant: false, isTabletCompliant: true }];
    tubeRepository = {
      findActiveByRecordIds: sinon.stub().resolves(tubesFromRepository),
    };

    thematicRepository = {
      findByCompetenceIds: sinon.stub().resolves().returns(expectedThematicsResult),
    };

    areaRepository = {
      findByFrameworkIdWithCompetences: sinon.stub().resolves().returns(expectedAreasResult),
    };

    frameworkRepository = {
      getByName: sinon.stub().resolves().returns(expectedFrameworkResult),
    };
  });

  it('should get the framework', async function () {
    // when
    const response = await usecases.getFrameworkAreas({
      frameworkId: 'frameworkId',
      locale: 'locale',
      tubeRepository,
      thematicRepository,
      areaRepository,
    });

    expect(response).to.deep.equal({
      tubes: expectedTubesResult,
      thematics: expectedThematicsResult,
      areas: expectedAreasResult,
    });
    expect(tubeRepository.findActiveByRecordIds).to.have.been.calledWith(['tubeId1'], 'locale');
    expect(thematicRepository.findByCompetenceIds).to.have.been.calledWith(['competenceId1'], 'locale');
    expect(areaRepository.findByFrameworkIdWithCompetences).to.have.been.calledWith({
      frameworkId: 'frameworkId',
      locale: 'locale',
    });
  });

  it('should a get framework by name', async function () {
    const response = await usecases.getFrameworkAreas({
      frameworkName: 'framework',
      locale: 'locale',
      tubeRepository,
      thematicRepository,
      areaRepository,
      frameworkRepository,
    });

    expect(response).to.deep.equal({
      tubes: expectedTubesResult,
      thematics: expectedThematicsResult,
      areas: expectedAreasResult,
    });
    expect(tubeRepository.findActiveByRecordIds).to.have.been.calledWith(['tubeId1'], 'locale');
    expect(thematicRepository.findByCompetenceIds).to.have.been.calledWith(['competenceId1'], 'locale');
    expect(areaRepository.findByFrameworkIdWithCompetences).to.have.been.calledWith({
      frameworkId: 'frameworkId',
      locale: 'locale',
    });
    expect(frameworkRepository.getByName).to.have.been.calledWithExactly('framework');
  });
});
