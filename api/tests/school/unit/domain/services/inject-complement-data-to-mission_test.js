import { Mission } from '../../../../../src/school/domain/models/Mission.js';
import { injectComplementDataTo } from '../../../../../src/school/domain/services/inject-complement-data-to-mission.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Service | injectComplementDataToMission', function () {
  let areaRepository, competenceRepository, organizationLearnerRepository;

  const areaCode = 1;
  const competenceName = 'Super nom';
  const index = '4.1';

  const mission = new Mission({
    id: 1,
    name: 'nameThemaFR1',
    competenceId: 'competenceId',
    thematicId: 'thematicId',
    learningObjectives: 'learningObjectivesi18n',
    validatedObjectives: 'validatedObjectivesi18n',
  });

  beforeEach(function () {
    areaRepository = { getAreaCodeByCompetenceId: sinon.stub() };
    areaRepository.getAreaCodeByCompetenceId.returns(areaCode);
    organizationLearnerRepository = { getDivisionsWhichStartedMission: sinon.stub() };
    organizationLearnerRepository.getDivisionsWhichStartedMission.returns('CM2-A, CM2-B');

    competenceRepository = { get: sinon.stub() };
    competenceRepository.get.returns({ name: competenceName, index });
  });

  it('Should add areaCode to Mission', async function () {
    const mutatedMission = await injectComplementDataTo({
      mission,
      areaRepository,
      competenceRepository,
      organizationLearnerRepository,
    });

    expect(mutatedMission.areaCode).to.deep.equal(areaCode);
  });

  it('Should add competence name to Mission', async function () {
    const mutatedMission = await injectComplementDataTo({
      mission,
      areaRepository,
      competenceRepository,
      organizationLearnerRepository,
    });

    expect(mutatedMission.competenceName).to.deep.equal(`${index} ${competenceName}`);
  });

  it('Should add startedBy informations to Mission', async function () {
    const organizationId = 12;

    const mutatedMission = await injectComplementDataTo({
      mission,
      organizationId,
      areaRepository,
      competenceRepository,
      organizationLearnerRepository,
    });

    expect(mutatedMission.startedBy).to.deep.equal('CM2-A, CM2-B');
  });
});
