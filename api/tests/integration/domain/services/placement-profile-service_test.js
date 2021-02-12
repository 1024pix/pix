const { expect, databaseBuilder, mockLearningContent, learningContentBuilder } = require('../../../test-helper');
const placementProfileService = require('../../../../lib/domain/services/placement-profile-service');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const { ENGLISH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Integration | Service | Placement Profile Service', function() {

  let userId, assessmentId;

  beforeEach(() => {
    const learningContent = [{
      id: 'areaOne',
      code: '1',
      color: 'jaffa',
      name: 'Domaine 1',
      titleFr: '1. Domaine 1',
      titleEn: '1. Area 1',
      competences: [{
        id: 'competenceRecordIdOne',
        nameFr: 'Construire un flipper',
        nameEn: 'Build a pinball',
        index: '1.1',
        tubes: [{
          id: 'recCitation',
          skills: [{
            id: 'recCitation4',
            nom: '@citation4',
            pixValue: 1,
            challenges: [
              'challengeRecordIdOne',
              'challengeRecordIdTwo',
              'challengeRecordIdTen',
            ],
          }],
        }],
      }, {
        id: 'competenceRecordIdTwo',
        nameFr: 'Adopter un dauphin',
        nameEn: 'Adopt a dolphin',
        index: '1.2',
        tubes: [{
          id: 'Remplir',
          skills: [{
            id: 'recRemplir2',
            nom: '@remplir2',
            pixValue: 1,
            challenges: [
              'challengeRecordIdOne',
              'challengeRecordIdFive',
            ],
          }, {
            id: 'recRemplir4',
            nom: '@remplir4',
            pixValue: 1,
            challenges: [
              'challengeRecordIdSix',
            ],
          }],
        }],
      }, {
        id: 'competenceRecordIdThree',
        nameFr: 'Se faire manger par un requin',
        nameEn: 'Getting eaten by a shark',
        index: '1.3',
        tubes: [{
          id: 'Requin',
          skills: [{
            id: 'recRequin5',
            nom: '@requin5',
            pixValue: 1,
            challenges: [
              'challengeRecordIdNine',
            ],
          }],
        }],
      }],
    }];

    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);

    userId = databaseBuilder.factory.buildUser().id;
    assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
    return databaseBuilder.commit();
  });

  context('V1 Profile', () => {
    describe('#getPlacementProfile', () => {

      const assessment1 = databaseBuilder.factory.buildAssessment({
        id: 13,
        status: 'completed',
        competenceId: 'competenceRecordIdOne',
      });
      const assessment2 = databaseBuilder.factory.buildAssessment({
        id: 1637,
        status: 'completed',
        competenceId: 'competenceRecordIdTwo',
      });
      const assessment3 = databaseBuilder.factory.buildAssessment({
        id: 145,
        status: 'completed',
        competenceId: 'competenceRecordIdUnknown',
      });
      databaseBuilder.factory.buildAssessmentResult({ level: 1, pixScore: 12, assessmentId: assessment1.id });
      databaseBuilder.factory.buildAssessmentResult({ level: 2, pixScore: 23, assessmentId: assessment2.id });
      databaseBuilder.factory.buildAssessmentResult({ level: 0, pixScore: 2, assessmentId: assessment3.id });

      beforeEach(() => {
        databaseBuilder.commit();
      });

      it('should load achieved assessments', async () => {
        // given
        const limitDate = '2020-10-27 08:44:25';

        // when
        const actualPlacementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate, isV2Certification: false });

        // then
        expect(actualPlacementProfile.userCompetences).to.deep.equal([
          {
            id: 'competenceRecordIdOne',
            index: '1.1',
            area: { id: 'areaOne', code: '1', color: 'jaffa', title: '1. Domaine 1', name: 'Domaine 1', competences: [] },
            name: 'Construire un flipper',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          },
          {
            id: 'competenceRecordIdTwo',
            index: '1.2',
            area: { id: 'areaOne', code: '1', color: 'jaffa', title: '1. Domaine 1', name: 'Domaine 1', competences: [] },
            name: 'Adopter un dauphin',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          },
          {
            id: 'competenceRecordIdThree',
            index: '1.3',
            area: { id: 'areaOne', code: '1', color: 'jaffa', title: '1. Domaine 1', name: 'Domaine 1', competences: [] },
            name: 'Se faire manger par un requin',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          }]);
      });
    });
  });

  context('V2 Profile', () => {
    const isV2Certification = true;
    describe('#getPlacementProfile', () => {

      it('should assign 0 pixScore and level of 0 to user competence when not assessed', async () => {
        // when
        const actualPlacementProfile = await placementProfileService.getPlacementProfile({
          userId,
          limitDate: '2020-10-27 08:44:25',
          isV2Certification,
        });

        // then
        expect(actualPlacementProfile.userCompetences).to.deep.equal([
          {
            id: 'competenceRecordIdOne',
            index: '1.1',
            area: { id: 'areaOne', code: '1', color: 'jaffa', title: '1. Domaine 1', name: 'Domaine 1', competences: [] },
            name: 'Construire un flipper',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          },
          {
            id: 'competenceRecordIdTwo',
            index: '1.2',
            area: { id: 'areaOne', code: '1', color: 'jaffa', title: '1. Domaine 1', name: 'Domaine 1', competences: [] },
            name: 'Adopter un dauphin',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          },
          {
            id: 'competenceRecordIdThree',
            index: '1.3',
            area: { id: 'areaOne', code: '1', color: 'jaffa', title: '1. Domaine 1', name: 'Domaine 1', competences: [] },
            name: 'Se faire manger par un requin',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          }]);
      });

      it('should return area and competence name according to given locale', async () => {
        // when
        const actualPlacementProfile = await placementProfileService.getPlacementProfile({
          userId,
          limitDate: new Date(),
          isV2Certification,
          locale: ENGLISH_SPOKEN,
        });

        // then
        const competenceName = actualPlacementProfile.userCompetences.map((competence) => competence.name);
        const areaTitle = actualPlacementProfile.userCompetences.map((competence) => competence.area.title);
        expect(competenceName).to.have.members(['Build a pinball', 'Adopt a dolphin', 'Getting eaten by a shark']);
        expect(areaTitle).to.have.members(['1. Area 1', '1. Area 1', '1. Area 1']);
      });

      it('should return area and competence name according to default locale', async () => {
        // when
        const actualPlacementProfile = await placementProfileService.getPlacementProfile({
          userId,
          limitDate: new Date(),
          isV2Certification,
        });

        // then
        const competenceName = actualPlacementProfile.userCompetences.map((competence) => competence.name);
        const areaTitle = actualPlacementProfile.userCompetences.map((competence) => competence.area.title);
        expect(competenceName).to.have.members(['Construire un flipper', 'Adopter un dauphin', 'Se faire manger par un requin']);
        expect(areaTitle).to.have.members(['1. Domaine 1', '1. Domaine 1', '1. Domaine 1']);
      });

      describe('PixScore by competences', () => {
        it('should assign pixScore and level to user competence based on knowledge elements', async () => {
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
            isV2Certification,
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
            skills: [{
              competenceId: 'competenceRecordIdTwo',
              id: 'recRemplir2',
              name: '@remplir2',
              pixValue: 1,
              tubeId: 'Remplir',
              tutorialIds: [],
            }],
          });
          expect(actualPlacementProfile.userCompetences[2]).to.deep.include({
            id: 'competenceRecordIdThree',
            pixScore: 0,
            estimatedLevel: 0,
            skills: [],
          });
        });

        it('should include both inferred and direct KnowlegdeElements to compute PixScore', async () => {
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
            isV2Certification,
          });

          // then
          expect(actualPlacementProfile.userCompetences[1].pixScore).to.equal(17);
        });

        context('when we dont want to limit pix score', () => {
          it('should not limit pixScore and level to the max reachable for user competence based on knowledge elements', async () => {
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
              isV2Certification,
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

        context('when we want to limit pix score', () => {
          it('should limit pixScore to 40 and level to 5', async () => {
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
              isV2Certification,
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

      describe('Skills not found in learningContent', () => {
        it('should skip not found skills', async () => {
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
            isV2Certification,
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
            skills: [{
              competenceId: 'competenceRecordIdTwo',
              id: 'recRemplir2',
              name: '@remplir2',
              pixValue: 1,
              tubeId: 'Remplir',
              tutorialIds: [],
            }],
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

  describe('#getPlacementProfilesWithSnapshotting', () => {
    const competences = [{
      id: 'competenceRecordIdOne',
      area: { id: 'areaOne', code: '1' },
      name: 'Construire un flipper',
      index: '1.1',
      skillIds: ['recCitation4', 'recMoteur3', 'recRecherche4'],
    }, {
      id: 'competenceRecordIdTwo',
      area: { id: 'areaOne', code: '1' },
      name: 'Adopter un dauphin',
      index: '1.2',
      skillIds: ['recRemplir2', 'recRemplir4', 'recUrl3', 'recWeb1'],
    }, {
      id: 'competenceRecordIdThree',
      area: { id: 'areaOne', code: '1' },
      name: 'Se faire manger par un requin',
      index: '1.3',
      skillIds: ['recRequin5', 'recRequin8'],
    }];

    it('should assign 0 pixScore and level of 0 to user competence when not assessed', async () => {
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
          area: { id: 'areaOne', code: '1' },
          name: 'Construire un flipper',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { id: 'areaOne', code: '1' },
          name: 'Adopter un dauphin',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
        },
        {
          id: 'competenceRecordIdThree',
          index: '1.3',
          area: { id: 'areaOne', code: '1' },
          name: 'Se faire manger par un requin',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
        }]);
    });

    describe('PixScore by competences', () => {

      it('should assign pixScore and level to user competence based on knowledge elements', async () => {
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

      it('should include both inferred and direct KnowlegdeElements to compute PixScore', async () => {
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

      context('when we dont want to limit pix score', () => {
        it('should not limit pixScore and level to the max reachable for user competence based on knowledge elements', async () => {
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

      context('when we want to limit pix score', () => {
        it('should limit pixScore to 40 and level to 5', async () => {
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
});
