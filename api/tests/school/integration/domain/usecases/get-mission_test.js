import { Mission } from '../../../../../src/school/domain/models/Mission.js';
import { getMission } from '../../../../../src/school/domain/usecases/get-mission.js';
import * as missionRepository from '../../../../../src/school/infrastructure/repositories/mission-repository.js';
import * as organizationLearnerRepository from '../../../../../src/school/infrastructure/repositories/organization-learner-repository.js';
import * as areaRepository from '../../../../../src/shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../../../src/shared/infrastructure/repositories/competence-repository.js';
import { databaseBuilder, expect, mockLearningContent } from '../../../../test-helper.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';
describe('Integration | UseCase | getMission', function () {
  it('Should return a mission', async function () {
    const mission = learningContentBuilder.buildMission({
      id: 12,
      name_i18n: { fr: 'truc' },
      competenceId: 'competenceId',
      thematicId: 'thematicId',
      status: 'a status',
      learningObjectives_i18n: { fr: 'Il était une fois' },
      validatedObjectives_i18n: { fr: 'Bravo ! tu as réussi !' },
    });

    const area = learningContentBuilder.buildArea({
      code: 3,
      competenceIds: ['competenceId'],
    });

    const organizationId = databaseBuilder.factory.buildOrganization().id;

    mockLearningContent({
      missions: [mission],
      areas: [area],
      competences: [{ id: 'competenceId', name_i18n: { fr: 'Name' }, index: '1.3' }],
    });

    const expectedMission = new Mission({
      id: 12,
      name: 'truc',
      competenceId: 'competenceId',
      competenceName: '1.3 Name',
      thematicId: 'thematicId',
      status: 'a status',
      areaCode: 3,
      learningObjectives: 'Il était une fois',
      validatedObjectives: 'Bravo ! tu as réussi !',
      startedBy: '',
    });

    const returnedMission = await getMission({
      missionId: 12,
      organizationId,
      missionRepository,
      areaRepository,
      competenceRepository,
      organizationLearnerRepository,
    });

    expect(returnedMission).to.deep.equal(expectedMission);
  });
});
