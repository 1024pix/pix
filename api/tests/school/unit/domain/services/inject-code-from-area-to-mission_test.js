import { Mission } from '../../../../../src/school/domain/models/Mission.js';
import { sinon, expect } from '../../../../test-helper.js';
import { injectCodeFromAreaTo } from '../../../../../src/school/domain/services/inject-code-from-area-to-mission.js';
describe('Unit | Service | injectCodeFromAreaToMission', function () {
  it('Should add areaCode to Mission', async function () {
    const areaRepository = { getAreaCodeByCompetenceId: sinon.stub() };
    const areaCode = 1;
    areaRepository.getAreaCodeByCompetenceId.returns(areaCode);

    const mission = new Mission({
      id: 1,
      name: 'nameThemaFR1',
      competenceId: 'competenceId',
      thematicId: 'thematicId',
      learningObjectives: 'learningObjectivesi18n',
      validatedObjectives: 'validatedObjectivesi18n',
    });

    const mutatedMission = await injectCodeFromAreaTo(mission, areaRepository);

    expect(mutatedMission.areaCode).to.deep.equal(areaCode);
  });
});
