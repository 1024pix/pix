import { expect, databaseBuilder, mockLearningContent, learningContentBuilder } from '../../../test-helper.js';
import * as placementProfileService from '../../../../lib/domain/services/placement-profile-service.js';
import { KnowledgeElement } from '../../../../lib/domain/models/KnowledgeElement.js';
import { LOCALE } from '../../../../src/shared/domain/constants.js';

const { ENGLISH_SPOKEN } = LOCALE;

describe('Integration | Service | Placement Profile Service', function () {
  let userId, assessmentId;

  beforeEach(function () {
    const learningContent = [
      {
        id: 'areaOne',
        code: '1',
        color: 'jaffa',
        frameworkId: 'recFmk123',
        competences: [
          {
            id: 'competenceRecordIdOne',
            name_i18n: { fr: 'Construire un flipper', en: 'Build a pinball' },
            index: '1.1',
            tubes: [
              {
                id: 'recCitation',
                skills: [
                  {
                    id: 'recCitation4',
                    nom: '@citation4',
                    pixValue: 1,
                    challenges: ['challengeRecordIdOne', 'challengeRecordIdTwo', 'challengeRecordIdTen'],
                    version: 1,
                    level: 4,
                  },
                ],
              },
            ],
          },
          {
            id: 'competenceRecordIdTwo',
            name_i18n: { fr: 'Adopter un dauphin', en: 'Adopt a dolphin' },
            index: '1.2',
            tubes: [
              {
                id: 'Remplir',
                skills: [
                  {
                    id: 'recRemplir2',
                    nom: '@remplir2',
                    pixValue: 1,
                    challenges: ['challengeRecordIdOne', 'challengeRecordIdFive'],
                    version: 1,
                    level: 2,
                  },
                  {
                    id: 'recRemplir4',
                    nom: '@remplir4',
                    pixValue: 1,
                    challenges: ['challengeRecordIdSix'],
                    version: 1,
                    level: 4,
                  },
                ],
              },
            ],
          },
          {
            id: 'competenceRecordIdThree',
            name_i18n: { fr: 'Se faire manger par un requin', en: 'Getting eaten by a shark' },
            index: '1.3',
            tubes: [
              {
                id: 'Requin',
                skills: [
                  {
                    id: 'recRequin5',
                    nom: '@requin5',
                    pixValue: 1,
                    challenges: ['challengeRecordIdNine'],
                    version: 1,
                    level: 5,
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    mockLearningContent(learningContentObjects);

    userId = databaseBuilder.factory.buildUser().id;
    assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
    return databaseBuilder.commit();
  });

  context('V1 Profile', function () {
    describe('#getPlacementProfile', function () {
      let assessment1;
      let assessment2;
      let assessment3;
      beforeEach(async function () {
        assessment1 = databaseBuilder.factory.buildAssessment({
          id: 13,
          status: 'completed',
          competenceId: 'competenceRecordIdOne',
        });
        assessment2 = databaseBuilder.factory.buildAssessment({
          id: 1637,
          status: 'completed',
          competenceId: 'competenceRecordIdTwo',
        });
        assessment3 = databaseBuilder.factory.buildAssessment({
          id: 145,
          status: 'completed',
          competenceId: 'competenceRecordIdUnknown',
        });
        databaseBuilder.factory.buildAssessmentResult({ level: 1, pixScore: 12, assessmentId: assessment1.id });
        databaseBuilder.factory.buildAssessmentResult({ level: 2, pixScore: 23, assessmentId: assessment2.id });
        databaseBuilder.factory.buildAssessmentResult({ level: 0, pixScore: 2, assessmentId: assessment3.id });

        await databaseBuilder.commit();
      });

      it('should load achieved assessments', async function () {
        // given
        const limitDate = '2020-10-27 08:44:25';

        // when
        const actualPlacementProfile = await placementProfileService.getPlacementProfile({
          userId,
          limitDate,
          version: 1,
        });

        // then
        expect(actualPlacementProfile.userCompetences).to.deep.equal([
          {
            id: 'competenceRecordIdOne',
            index: '1.1',
            areaId: 'areaOne',
            name: 'Construire un flipper',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          },
          {
            id: 'competenceRecordIdTwo',
            index: '1.2',
            areaId: 'areaOne',
            name: 'Adopter un dauphin',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          },
          {
            id: 'competenceRecordIdThree',
            index: '1.3',
            areaId: 'areaOne',
            name: 'Se faire manger par un requin',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          },
        ]);
      });
    });
  });

  context('V2 Profile', function () {
    describe('#getPlacementProfile', function () {
      it('should assign 0 pixScore and level of 0 to user competence when not assessed', async function () {
        // when
        const actualPlacementProfile = await placementProfileService.getPlacementProfile({
          userId,
          limitDate: '2020-10-27 08:44:25',
          version: 2,
        });

        // then
        expect(actualPlacementProfile.userCompetences).to.deep.equal([
          {
            id: 'competenceRecordIdOne',
            index: '1.1',
            areaId: 'areaOne',
            name: 'Construire un flipper',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          },
          {
            id: 'competenceRecordIdTwo',
            index: '1.2',
            areaId: 'areaOne',
            name: 'Adopter un dauphin',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          },
          {
            id: 'competenceRecordIdThree',
            index: '1.3',
            areaId: 'areaOne',
            name: 'Se faire manger par un requin',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          },
        ]);
      });

      it('should return competence name according to given locale', async function () {
        // when
        const actualPlacementProfile = await placementProfileService.getPlacementProfile({
          userId,
          limitDate: new Date(),
          version: 2,
          locale: ENGLISH_SPOKEN,
        });

        // then
        const competenceName = actualPlacementProfile.userCompetences.map((competence) => competence.name);
        expect(competenceName).to.have.members(['Build a pinball', 'Adopt a dolphin', 'Getting eaten by a shark']);
      });

      it('should return competence name according to default locale', async function () {
        // when
        const actualPlacementProfile = await placementProfileService.getPlacementProfile({
          userId,
          limitDate: new Date(),
          version: 2,
        });

        // then
        const competenceName = actualPlacementProfile.userCompetences.map((competence) => competence.name);
        expect(competenceName).to.have.members([
          'Construire un flipper',
          'Adopter un dauphin',
          'Se faire manger par un requin',
        ]);
      });

      describe('PixScore by competences', function () {
        it('should assign pixScore and level to user competence based on knowledge elements', async function () {
          // given
          databaseBuilder.factory.buildKnowledgeElement({
            competenceId: 'competenceRecordIdTwo',
            skillId: 'recRemplir2',
            earnedPix: 23,
            userId,
            assessmentId,
          });
          await databaseBuilder.commit();

          // when
          const actualPlacementProfile = await placementProfileService.getPlacementProfile({
            userId,
            limitDate: new Date(),
            version: 2,
          });

          // then
          expect(actualPlacementProfile.userCompetences[0]).to.deep.include({
            id: 'competenceRecordIdOne',
            pixScore: 0,
            estimatedLevel: 0,
            skills: [],
          });
          expect(actualPlacementProfile.userCompetences[1]).to.deep.include({
            id: 'competenceRecordIdTwo',
            pixScore: 23,
            estimatedLevel: 2,
            skills: [
              {
                competenceId: 'competenceRecordIdTwo',
                id: 'recRemplir2',
                name: '@remplir2',
                pixValue: 1,
                tubeId: 'Remplir',
                tutorialIds: [],
                learningMoreTutorialIds: [],
                version: 1,
                difficulty: 2,
              },
            ],
          });
          expect(actualPlacementProfile.userCompetences[2]).to.deep.include({
            id: 'competenceRecordIdThree',
            pixScore: 0,
            estimatedLevel: 0,
            skills: [],
          });
        });

        it('should include both inferred and direct KnowlegdeElements to compute PixScore', async function () {
          // given
          databaseBuilder.factory.buildKnowledgeElement({
            competenceId: 'competenceRecordIdTwo',
            skillId: 'recRemplir2',
            earnedPix: 8,
            source: KnowledgeElement.SourceType.INFERRED,
            userId,
            assessmentId,
          });

          databaseBuilder.factory.buildKnowledgeElement({
            competenceId: 'competenceRecordIdTwo',
            skillId: 'recRemplir4',
            earnedPix: 9,
            source: KnowledgeElement.SourceType.DIRECT,
            userId,
            assessmentId,
          });
          await databaseBuilder.commit();

          // when
          const actualPlacementProfile = await placementProfileService.getPlacementProfile({
            userId,
            limitDate: new Date(),
            version: 2,
          });

          // then
          expect(actualPlacementProfile.userCompetences[1].pixScore).to.equal(17);
        });

        context('when we dont want to limit pix score', function () {
          it('should not limit pixScore and level to the max reachable for user competence based on knowledge elements', async function () {
            databaseBuilder.factory.buildKnowledgeElement({
              competenceId: 'competenceRecordIdOne',
              earnedPix: 64,
              userId,
              assessmentId,
            });
            await databaseBuilder.commit();

            // when
            const actualPlacementProfile = await placementProfileService.getPlacementProfile({
              userId,
              limitDate: new Date(),
              version: 2,
              allowExcessPixAndLevels: true,
            });

            // then
            expect(actualPlacementProfile.userCompetences[0]).to.deep.include({
              id: 'competenceRecordIdOne',
              pixScore: 64,
              estimatedLevel: 8,
            });
          });
        });

        context('when we want to limit pix score', function () {
          it('should limit pixScore to 40 and level to 5', async function () {
            databaseBuilder.factory.buildKnowledgeElement({
              competenceId: 'competenceRecordIdOne',
              earnedPix: 64,
              userId,
              assessmentId,
            });
            await databaseBuilder.commit();

            // when
            const actualPlacementProfile = await placementProfileService.getPlacementProfile({
              userId,
              limitDate: new Date(),
              version: 2,
              allowExcessPixAndLevels: false,
            });

            // then
            expect(actualPlacementProfile.userCompetences[0]).to.include({
              id: 'competenceRecordIdOne',
              pixScore: 40,
              estimatedLevel: 5,
            });
          });
        });
      });

      describe('Skills not found in learningContent', function () {
        it('should skip not found skills', async function () {
          // given
          databaseBuilder.factory.buildKnowledgeElement({
            competenceId: 'competenceRecordIdTwo',
            skillId: 'recRemplir2',
            earnedPix: 11,
            userId,
            assessmentId,
          });

          databaseBuilder.factory.buildKnowledgeElement({
            competenceId: 'competenceRecordIdTwo',
            skillId: 'missing skill id',
            earnedPix: 11,
            userId,
            assessmentId,
          });
          await databaseBuilder.commit();

          // when
          const actualPlacementProfile = await placementProfileService.getPlacementProfile({
            userId,
            limitDate: new Date(),
            version: 2,
          });

          // then
          expect(actualPlacementProfile.userCompetences[0]).to.deep.include({
            id: 'competenceRecordIdOne',
            pixScore: 0,
            estimatedLevel: 0,
            skills: [],
          });
          expect(actualPlacementProfile.userCompetences[1]).to.deep.include({
            id: 'competenceRecordIdTwo',
            pixScore: 22,
            estimatedLevel: 2,
            skills: [
              {
                competenceId: 'competenceRecordIdTwo',
                id: 'recRemplir2',
                name: '@remplir2',
                pixValue: 1,
                tubeId: 'Remplir',
                tutorialIds: [],
                learningMoreTutorialIds: [],
                version: 1,
                difficulty: 2,
              },
            ],
          });
          expect(actualPlacementProfile.userCompetences[2]).to.deep.include({
            id: 'competenceRecordIdThree',
            pixScore: 0,
            estimatedLevel: 0,
            skills: [],
          });
        });
      });
    });
  });

  describe('#getPlacementProfilesWithSnapshotting', function () {
    const competences = [
      {
        id: 'competenceRecordIdOne',
        area: { id: 'areaOne', code: '1' },
        areaId: 'areaOne',
        name: 'Construire un flipper',
        index: '1.1',
        skillIds: ['recCitation4', 'recMoteur3', 'recRecherche4'],
      },
      {
        id: 'competenceRecordIdTwo',
        area: { id: 'areaOne', code: '1' },
        areaId: 'areaOne',
        name: 'Adopter un dauphin',
        index: '1.2',
        skillIds: ['recRemplir2', 'recRemplir4', 'recUrl3', 'recWeb1'],
      },
      {
        id: 'competenceRecordIdThree',
        area: { id: 'areaOne', code: '1' },
        areaId: 'areaOne',
        name: 'Se faire manger par un requin',
        index: '1.3',
        skillIds: ['recRequin5', 'recRequin8'],
      },
    ];

    it('should assign 0 pixScore and level of 0 to user competence when not assessed', async function () {
      // when
      const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
        userIdsAndDates: { [userId]: new Date() },
        competences,
      });

      // then
      expect(actualPlacementProfiles[0].userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          areaId: 'areaOne',
          name: 'Construire un flipper',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          areaId: 'areaOne',
          name: 'Adopter un dauphin',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
        },
        {
          id: 'competenceRecordIdThree',
          index: '1.3',
          areaId: 'areaOne',
          name: 'Se faire manger par un requin',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
        },
      ]);
    });

    describe('PixScore by competences', function () {
      it('should assign pixScore and level to user competence based on knowledge elements', async function () {
        // given
        databaseBuilder.factory.buildKnowledgeElement({
          competenceId: 'competenceRecordIdTwo',
          skillId: 'recRemplir2',
          earnedPix: 23,
          userId,
          assessmentId,
        });
        await databaseBuilder.commit();

        // when
        const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
          userIdsAndDates: { [userId]: new Date() },
          competences,
        });

        // then
        expect(actualPlacementProfiles[0].userCompetences[0]).to.include({
          id: 'competenceRecordIdOne',
          pixScore: 0,
          estimatedLevel: 0,
        });
        expect(actualPlacementProfiles[0].userCompetences[1]).to.include({
          id: 'competenceRecordIdTwo',
          pixScore: 23,
          estimatedLevel: 2,
        });
      });

      it('should include both inferred and direct KnowlegdeElements to compute PixScore', async function () {
        // given
        databaseBuilder.factory.buildKnowledgeElement({
          competenceId: 'competenceRecordIdTwo',
          skillId: 'recRemplir2',
          earnedPix: 8,
          source: KnowledgeElement.SourceType.INFERRED,
          userId,
          assessmentId,
        });

        databaseBuilder.factory.buildKnowledgeElement({
          competenceId: 'competenceRecordIdTwo',
          skillId: 'recRemplir4',
          earnedPix: 9,
          source: KnowledgeElement.SourceType.DIRECT,
          userId,
          assessmentId,
        });
        await databaseBuilder.commit();

        // when
        const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
          userIdsAndDates: { [userId]: new Date() },
          competences,
        });

        // then
        expect(actualPlacementProfiles[0].userCompetences[1].pixScore).to.equal(17);
      });

      context('when we dont want to limit pix score', function () {
        it('should not limit pixScore and level to the max reachable for user competence based on knowledge elements', async function () {
          databaseBuilder.factory.buildKnowledgeElement({
            competenceId: 'competenceRecordIdOne',
            earnedPix: 64,
            userId,
            assessmentId,
          });
          await databaseBuilder.commit();

          // when
          const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
            userIdsAndDates: { [userId]: new Date() },
            competences,
            allowExcessPixAndLevels: true,
          });

          // then
          expect(actualPlacementProfiles[0].userCompetences[0]).to.include({
            id: 'competenceRecordIdOne',
            pixScore: 64,
            estimatedLevel: 8,
          });
        });
      });

      context('when we want to limit pix score', function () {
        it('should limit pixScore to 40 and level to 5', async function () {
          databaseBuilder.factory.buildKnowledgeElement({
            competenceId: 'competenceRecordIdOne',
            earnedPix: 64,
            userId,
            assessmentId,
          });
          await databaseBuilder.commit();

          // when
          const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
            userIdsAndDates: { [userId]: new Date() },
            competences,
            allowExcessPixAndLevels: false,
          });

          // then
          expect(actualPlacementProfiles[0].userCompetences[0]).to.include({
            id: 'competenceRecordIdOne',
            pixScore: 40,
            estimatedLevel: 5,
          });
        });
      });
    });
  });

  describe('#getPlacementProfileWithSnapshotting', function () {
    const competences = [
      {
        id: 'competenceRecordIdOne',
        area: { id: 'areaOne', code: '1' },
        areaId: 'areaOne',
        name: 'Construire un flipper',
        index: '1.1',
        skillIds: ['recCitation4', 'recMoteur3', 'recRecherche4'],
      },
      {
        id: 'competenceRecordIdTwo',
        area: { id: 'areaOne', code: '1' },
        areaId: 'areaOne',
        name: 'Adopter un dauphin',
        index: '1.2',
        skillIds: ['recRemplir2', 'recRemplir4', 'recUrl3', 'recWeb1'],
      },
      {
        id: 'competenceRecordIdThree',
        area: { id: 'areaOne', code: '1' },
        areaId: 'areaOne',
        name: 'Se faire manger par un requin',
        index: '1.3',
        skillIds: ['recRequin5', 'recRequin8'],
      },
    ];

    it('should assign 0 pixScore and level of 0 to user competence when not assessed', async function () {
      // when
      const actualPlacementProfile = await placementProfileService.getPlacementProfileWithSnapshotting({
        userId,
        limitDate: new Date(),
        competences,
      });

      // then
      expect(actualPlacementProfile.userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          areaId: 'areaOne',
          name: 'Construire un flipper',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          areaId: 'areaOne',
          name: 'Adopter un dauphin',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
        },
        {
          id: 'competenceRecordIdThree',
          index: '1.3',
          areaId: 'areaOne',
          name: 'Se faire manger par un requin',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
        },
      ]);
    });

    describe('PixScore by competences', function () {
      it('should assign pixScore and level to user competence based on knowledge elements', async function () {
        // given
        databaseBuilder.factory.buildKnowledgeElement({
          competenceId: 'competenceRecordIdTwo',
          skillId: 'recRemplir2',
          earnedPix: 23,
          userId,
          assessmentId,
        });
        await databaseBuilder.commit();

        // when
        const actualPlacementProfile = await placementProfileService.getPlacementProfileWithSnapshotting({
          userId,
          limitDate: new Date(),
          competences,
        });

        // then
        expect(actualPlacementProfile.userCompetences[0]).to.include({
          id: 'competenceRecordIdOne',
          pixScore: 0,
          estimatedLevel: 0,
        });
        expect(actualPlacementProfile.userCompetences[1]).to.include({
          id: 'competenceRecordIdTwo',
          pixScore: 23,
          estimatedLevel: 2,
        });
      });

      it('should include both inferred and direct KnowlegdeElements to compute PixScore', async function () {
        // given
        databaseBuilder.factory.buildKnowledgeElement({
          competenceId: 'competenceRecordIdTwo',
          skillId: 'recRemplir2',
          earnedPix: 8,
          source: KnowledgeElement.SourceType.INFERRED,
          userId,
          assessmentId,
        });

        databaseBuilder.factory.buildKnowledgeElement({
          competenceId: 'competenceRecordIdTwo',
          skillId: 'recRemplir4',
          earnedPix: 9,
          source: KnowledgeElement.SourceType.DIRECT,
          userId,
          assessmentId,
        });
        await databaseBuilder.commit();

        // when
        const actualPlacementProfile = await placementProfileService.getPlacementProfileWithSnapshotting({
          userId,
          limitDate: new Date(),
          competences,
        });

        // then
        expect(actualPlacementProfile.userCompetences[1].pixScore).to.equal(17);
      });

      context('when we dont want to limit pix score', function () {
        it('should not limit pixScore and level to the max reachable for user competence based on knowledge elements', async function () {
          databaseBuilder.factory.buildKnowledgeElement({
            competenceId: 'competenceRecordIdOne',
            earnedPix: 64,
            userId,
            assessmentId,
          });
          await databaseBuilder.commit();

          // when
          const actualPlacementProfile = await placementProfileService.getPlacementProfileWithSnapshotting({
            userId,
            limitDate: new Date(),
            competences,
            allowExcessPixAndLevels: true,
          });

          // then
          expect(actualPlacementProfile.userCompetences[0]).to.include({
            id: 'competenceRecordIdOne',
            pixScore: 64,
            estimatedLevel: 8,
          });
        });
      });

      context('when we want to limit pix score', function () {
        it('should limit pixScore to 40 and level to 5', async function () {
          databaseBuilder.factory.buildKnowledgeElement({
            competenceId: 'competenceRecordIdOne',
            earnedPix: 64,
            userId,
            assessmentId,
          });
          await databaseBuilder.commit();

          // when
          const actualPlacementProfile = await placementProfileService.getPlacementProfileWithSnapshotting({
            userId,
            limitDate: new Date(),
            competences,
            allowExcessPixAndLevels: false,
          });

          // then
          expect(actualPlacementProfile.userCompetences[0]).to.include({
            id: 'competenceRecordIdOne',
            pixScore: 40,
            estimatedLevel: 5,
          });
        });
      });
    });
  });
});
