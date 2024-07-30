import { Mission } from '../../../../../src/school/domain/models/Mission.js';
import { usecases } from '../../../../../src/school/domain/usecases/index.js';
import { config } from '../../../../../src/shared/config.js';
import { databaseBuilder, expect, mockLearningContent } from '../../../../test-helper.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

describe('Integration | UseCases | find-all-active-missions', function () {
  it('returns empty array without missions from LCMS', async function () {
    const expectedMissions = [];

    mockLearningContent({
      missions: [],
    });

    const returnedMissions = await usecases.findAllActiveMissions();
    expect(returnedMissions).to.deep.equal(expectedMissions);
  });

  context('when FT_SHOW_EXPERIMENTAL_MISSION is false', function () {
    beforeEach(function () {
      config.featureToggles.showExperimentalMissions = false;
    });

    it('returns validated missions from LCMS', async function () {
      const validatedMission = learningContentBuilder.buildMission({
        id: 12,
        name_i18n: { fr: 'truc' },
        competenceId: 'competenceId',
        thematicId: 'thematicId',
        status: 'VALIDATED',
        learningObjectives_i18n: { fr: 'Il était une fois' },
        validatedObjectives_i18n: { fr: 'Bravo ! tu as réussi !' },
      });

      const experimentalMission = learningContentBuilder.buildMission({
        id: 13,
        name_i18n: { fr: 'truc' },
        competenceId: 'competenceId',
        thematicId: 'thematicId',
        status: 'EXPERIMENTAL',
        learningObjectives_i18n: { fr: 'Il était une fois' },
        validatedObjectives_i18n: { fr: 'Bravo ! tu as réussi !' },
      });

      const inactiveMission = learningContentBuilder.buildMission({
        id: 14,
        name_i18n: { fr: 'truc' },
        competenceId: 'competenceId',
        thematicId: 'thematicId',
        status: 'INACTIVE',
        learningObjectives_i18n: { fr: 'Il était une fois' },
        validatedObjectives_i18n: { fr: 'Bravo ! tu as réussi !' },
      });

      const area = learningContentBuilder.buildArea({
        code: 3,
        competenceIds: ['competenceId'],
      });

      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const competence = {
        id: 'competenceId',
        index: '4.5',
        name_i18n: {
          fr: 'Competence',
        },
      };

      mockLearningContent({
        missions: [validatedMission, experimentalMission, inactiveMission],
        areas: [area],
        competences: [competence],
      });

      const expectedMission = new Mission({
        id: 12,
        name: 'truc',
        competenceId: 'competenceId',
        thematicId: 'thematicId',
        competenceName: '4.5 Competence',
        status: 'ACTIVE',
        areaCode: 3,
        learningObjectives: 'Il était une fois',
        validatedObjectives: 'Bravo ! tu as réussi !',
        startedBy: '',
      });
      const expectedMissions = [expectedMission];
      const returnedMissions = await usecases.findAllActiveMissions({ organizationId });

      expect(returnedMissions).to.deep.equal(expectedMissions);
    });
  });

  context('when FT_SHOW_EXPERIMENTAL_MISSION is true', function () {
    beforeEach(function () {
      config.featureToggles.showExperimentalMissions = true;
    });

    it('returns validated and experimental missions from LCMS', async function () {
      const validatedMission = learningContentBuilder.buildMission({
        id: 12,
        name_i18n: { fr: 'truc' },
        competenceId: 'competenceId',
        thematicId: 'thematicId',
        status: 'VALIDATED',
        learningObjectives_i18n: { fr: 'Il était une fois' },
        validatedObjectives_i18n: { fr: 'Bravo ! tu as réussi !' },
      });

      const experimentalMission = learningContentBuilder.buildMission({
        id: 13,
        name_i18n: { fr: 'truc' },
        competenceId: 'competenceId',
        thematicId: 'thematicId',
        status: 'EXPERIMENTAL',
        learningObjectives_i18n: { fr: 'Il était une fois' },
        validatedObjectives_i18n: { fr: 'Bravo ! tu as réussi !' },
      });

      const inactiveMission = learningContentBuilder.buildMission({
        id: 14,
        name_i18n: { fr: 'truc' },
        competenceId: 'competenceId',
        thematicId: 'thematicId',
        status: 'INACTIVE',
        learningObjectives_i18n: { fr: 'Il était une fois' },
        validatedObjectives_i18n: { fr: 'Bravo ! tu as réussi !' },
      });

      const area = learningContentBuilder.buildArea({
        code: 3,
        competenceIds: ['competenceId'],
      });

      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const competence = {
        id: 'competenceId',
        index: '4.5',
        name_i18n: {
          fr: 'Competence',
        },
      };

      mockLearningContent({
        missions: [validatedMission, experimentalMission, inactiveMission],
        areas: [area],
        competences: [competence],
      });

      const expectedMissions = [
        new Mission({
          id: 12,
          name: 'truc',
          competenceId: 'competenceId',
          thematicId: 'thematicId',
          competenceName: '4.5 Competence',
          status: 'ACTIVE',
          areaCode: 3,
          learningObjectives: 'Il était une fois',
          validatedObjectives: 'Bravo ! tu as réussi !',
          startedBy: '',
        }),
        new Mission({
          id: 13,
          name: 'truc',
          competenceId: 'competenceId',
          thematicId: 'thematicId',
          competenceName: '4.5 Competence',
          status: 'EXPERIMENTAL',
          areaCode: 3,
          learningObjectives: 'Il était une fois',
          validatedObjectives: 'Bravo ! tu as réussi !',
          startedBy: '',
        }),
      ];
      const returnedMissions = await usecases.findAllActiveMissions({ organizationId });

      expect(returnedMissions).to.deep.equal(expectedMissions);
    });
  });
});
