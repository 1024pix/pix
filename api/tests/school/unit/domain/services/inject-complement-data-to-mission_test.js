import { Mission } from '../../../../../src/school/domain/models/Mission.js';
import { sinon, expect } from '../../../../test-helper.js';
import { injectComplementDataTo } from '../../../../../src/school/domain/services/inject-complement-data-to-mission.js';
describe('Unit | Service | injectComplementDataToMission', function () {
  it('Should add areaCode and competence name to Mission', async function () {
    const areaRepository = { getAreaCodeByCompetenceId: sinon.stub() };
    const areaCode = 1;
    areaRepository.getAreaCodeByCompetenceId.returns(areaCode);
    const competenceRepository = { get: sinon.stub() };
    const competenceName = 'Super nom';
    const index = '4.1';
    competenceRepository.get.returns({ name: competenceName, index });

    const mission = new Mission({
      id: 1,
      name: 'nameThemaFR1',
      competenceId: 'competenceId',
      thematicId: 'thematicId',
      learningObjectives: 'learningObjectivesi18n',
      validatedObjectives: 'validatedObjectivesi18n',
    });

    const mutatedMission = await injectComplementDataTo(mission, areaRepository, competenceRepository);

    expect(mutatedMission.areaCode).to.deep.equal(areaCode);
    expect(mutatedMission.competenceName).to.deep.equal(`${index} ${competenceName}`);
  });
});
