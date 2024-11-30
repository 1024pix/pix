import { Mission } from '../../../../../src/school/domain/models/Mission.js';
import { usecases } from '../../../../../src/school/domain/usecases/index.js';
import { config } from '../../../../../src/shared/config.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | UseCases | find-all-active-missions', function () {
  context('when no active missions', function () {
    it('returns empty array without missions from LCMS', async function () {
      const returnedMissions = await usecases.findAllActiveMissions();
      expect(returnedMissions).to.deep.equal([]);
    });
  });

  context('when active missions', function () {
    let missionValideeDB, missionExperimentaleDB;
    let organizationId;
    beforeEach(async function () {
      databaseBuilder.factory.learningContent.buildArea({
        id: 'areaId',
        code: '3',
        competenceIds: ['competenceId'],
      });
      databaseBuilder.factory.learningContent.buildCompetence({
        id: 'competenceId',
        index: '4.5',
        name_i18n: {
          fr: 'Competence',
        },
        areaId: 'areaId',
      });
      missionValideeDB = databaseBuilder.factory.learningContent.buildMission({
        id: 12,
        name_i18n: { fr: 'name fr missionValideeDB' },
        competenceId: 'competenceId',
        thematicId: 'thematicId',
        status: 'VALIDATED',
        learningObjectives_i18n: { fr: 'learningObjectives fr missionValideeDB' },
        validatedObjectives_i18n: { fr: 'validatedObjectives fr missionValideeDB' },
        introductionMediaAlt_i18n: { fr: 'introductionMediaAlt fr missionValideeDB' },
        content: {
          steps: [
            {
              name_i18n: { fr: 'content step name fr missionValideeDB' },
            },
          ],
          dareChallenges: [],
        },
      });
      missionExperimentaleDB = databaseBuilder.factory.learningContent.buildMission({
        id: 13,
        name_i18n: { fr: 'name fr missionExperimentaleDB' },
        competenceId: 'competenceId',
        thematicId: 'thematicId',
        status: 'EXPERIMENTAL',
        learningObjectives_i18n: { fr: 'learningObjectives fr missionExperimentaleDB' },
        validatedObjectives_i18n: { fr: 'validatedObjectives fr missionExperimentaleDB' },
        introductionMediaAlt_i18n: { fr: 'introductionMediaAlt fr missionExperimentaleDB' },
        content: {
          steps: [
            {
              name_i18n: { fr: 'content step name fr missionExperimentaleDB' },
            },
          ],
          dareChallenges: [],
        },
      });
      databaseBuilder.factory.learningContent.buildMission({
        id: 14,
        name_i18n: { fr: 'name fr missionInactiveDB' },
        competenceId: 'competenceId',
        thematicId: 'thematicId',
        status: 'INACTIVE',
        learningObjectives_i18n: { fr: 'learningObjectives fr missionInactiveDB' },
        validatedObjectives_i18n: { fr: 'validatedObjectives fr missionInactiveDB' },
        introductionMediaAlt_i18n: { fr: 'introductionMediaAlt fr missionInactiveDB' },
        content: {
          steps: [
            {
              name_i18n: { fr: 'content step name fr missionInactiveDB' },
            },
          ],
          dareChallenges: [],
        },
      });
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    context('when FT_SHOW_EXPERIMENTAL_MISSION is false', function () {
      beforeEach(function () {
        config.featureToggles.showExperimentalMissions = false;
      });

      it('returns validated missions from LCMS', async function () {
        // when
        const returnedMissions = await usecases.findAllActiveMissions({ organizationId });

        // then
        const expectedMission = new Mission({
          ...missionValideeDB,
          name: missionValideeDB.name_i18n.fr,
          learningObjectives: missionValideeDB.learningObjectives_i18n.fr,
          validatedObjectives: missionValideeDB.validatedObjectives_i18n.fr,
          introductionMediaAlt: missionValideeDB.introductionMediaAlt_i18n.fr,
          content: {
            steps: [
              {
                name: missionValideeDB.content.steps[0].name_i18n.fr,
              },
            ],
            dareChallenges: [],
          },
        });
        expect(returnedMissions).to.deep.equal([
          {
            ...expectedMission,
            areaCode: '3',
            competenceName: '4.5 Competence',
            startedBy: '',
          },
        ]);
      });
    });

    context('when FT_SHOW_EXPERIMENTAL_MISSION is true', function () {
      beforeEach(function () {
        config.featureToggles.showExperimentalMissions = true;
      });

      it('returns validated and experimental missions from LCMS', async function () {
        // when
        const returnedMissions = await usecases.findAllActiveMissions({ organizationId });

        // then
        const expectedMissionValidee = new Mission({
          ...missionValideeDB,
          name: missionValideeDB.name_i18n.fr,
          learningObjectives: missionValideeDB.learningObjectives_i18n.fr,
          validatedObjectives: missionValideeDB.validatedObjectives_i18n.fr,
          introductionMediaAlt: missionValideeDB.introductionMediaAlt_i18n.fr,
          content: {
            steps: [
              {
                name: missionValideeDB.content.steps[0].name_i18n.fr,
              },
            ],
            dareChallenges: [],
          },
        });
        const expectedMissionExperimentale = new Mission({
          ...missionExperimentaleDB,
          name: missionExperimentaleDB.name_i18n.fr,
          learningObjectives: missionExperimentaleDB.learningObjectives_i18n.fr,
          validatedObjectives: missionExperimentaleDB.validatedObjectives_i18n.fr,
          introductionMediaAlt: missionExperimentaleDB.introductionMediaAlt_i18n.fr,
          content: {
            steps: [
              {
                name: missionExperimentaleDB.content.steps[0].name_i18n.fr,
              },
            ],
            dareChallenges: [],
          },
        });
        expect(returnedMissions).to.deep.equal([
          {
            ...expectedMissionValidee,
            areaCode: '3',
            competenceName: '4.5 Competence',
            startedBy: '',
          },
          {
            ...expectedMissionExperimentale,
            areaCode: '3',
            competenceName: '4.5 Competence',
            startedBy: '',
          },
        ]);
      });
    });
  });
});
