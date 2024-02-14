import { expect, mockLearningContent } from '../../../../test-helper.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';
import { usecases } from '../../../../../src/school/domain/usecases/index.js';
import { Mission } from '../../../../../src/school/domain/models/Mission.js';

describe('Integration | UseCases | find-all-missions', function () {
  it('return empty array without missions from LCMS', async function () {
    const expectedMissions = [];

    mockLearningContent({
      missions: [],
    });

    const returnedMissions = await usecases.findAllMissions();
    expect(returnedMissions).to.deep.equal(expectedMissions);
  });

  it('return missions from LCMS', async function () {
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

    mockLearningContent({
      missions: [mission],
      areas: [area],
    });

    const expectedMission = new Mission({
      id: 12,
      name: 'truc',
      competenceId: 'competenceId',
      thematicId: 'thematicId',
      status: 'a status',
      areaCode: 3,
      learningObjectives: 'Il était une fois',
      validatedObjectives: 'Bravo ! tu as réussi !',
    });
    const expectedMissions = [expectedMission];
    const returnedMissions = await usecases.findAllMissions();

    expect(returnedMissions).to.deep.equal(expectedMissions);
  });
});
