import { Mission } from '../../../../../src/school/domain/models/Mission.js';
import { usecases } from '../../../../../src/school/domain/usecases/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | UseCase | getMission', function () {
  it('Should return a mission', async function () {
    // given
    databaseBuilder.factory.learningContent.buildArea({
      id: 'areaId',
      code: '3',
      competenceIds: ['competenceId'],
    });
    databaseBuilder.factory.learningContent.buildCompetence({
      id: 'competenceId',
      name_i18n: { fr: 'Name' },
      index: '1.3',
      areaId: 'areaId',
    });
    const missionDB = databaseBuilder.factory.learningContent.buildMission({
      id: 12,
      name_i18n: { fr: 'truc' },
      competenceId: 'competenceId',
      thematicId: 'thematicId',
      status: 'a status',
      learningObjectives_i18n: { fr: 'Il était une fois' },
      validatedObjectives_i18n: { fr: 'Bravo ! tu as réussi !' },
      content: {
        steps: [
          {
            name_i18n: { fr: 'truc' },
          },
        ],
        dareChallenges: [],
      },
    });
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    await databaseBuilder.commit();

    // when
    const returnedMission = await usecases.getMission({
      missionId: 12,
      organizationId,
    });

    // then
    const expectedMission = new Mission({
      ...missionDB,
      name: missionDB.name_i18n.fr,
      learningObjectives: missionDB.learningObjectives_i18n.fr,
      validatedObjectives: missionDB.validatedObjectives_i18n.fr,
      introductionMediaAlt: missionDB.introductionMediaAlt_i18n.fr,
      content: {
        steps: [
          {
            name: 'truc',
          },
        ],
        dareChallenges: [],
      },
    });
    expect(returnedMission).to.deep.equal({
      ...expectedMission,
      areaCode: '3',
      competenceName: '1.3 Name',
      startedBy: '',
    });
  });
});
