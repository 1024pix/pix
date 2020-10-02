const { expect, sinon, domainBuilder } = require('../../../test-helper');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const placementProfileService = require('../../../../lib/domain/services/placement-profile-service');

const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Competence = require('../../../../lib/domain/models/Competence');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const Skill = require('../../../../lib/domain/models/Skill');

describe('Integration | Service | Placement Profile Service', function() {

  const userId = 63731;

  function _createCompetence(id, index, name, areaCode) {
    const competence = new Competence();
    competence.id = id;
    competence.index = index;
    competence.name = name;
    competence.area = { code: areaCode };

    return competence;
  }

  function _createChallenge(id, competence, skills, testedSkill) {
    const challenge = new Challenge();
    challenge.id = id;
    challenge.skills = skills;
    challenge.competenceId = competence;
    challenge.testedSkill = testedSkill;
    return challenge;
  }

  const skillCitation4 = new Skill({ id: 10, name: '@citation4' });
  const skillCollaborer4 = new Skill({ id: 20, name: '@collaborer4' });
  const skillMoteur3 = new Skill({ id: 30, name: '@moteur3' });
  const skillRecherche4 = new Skill({ id: 40, name: '@recherche4' });
  const skillRemplir2 = new Skill({ id: 50, name: '@remplir2' });
  const skillRemplir4 = new Skill({ id: 60, name: '@remplir4' });
  const skillUrl3 = new Skill({ id: 70, name: '@url3' });
  const skillWeb1 = new Skill({ id: 80, name: '@web1' });
  const skillRequin5 = new Skill({ id: 110, name: '@requin5' });
  const skillRequin8 = new Skill({ id: 120, name: '@requin8' });

  const competenceFlipper = _createCompetence('competenceRecordIdOne', '1.1', '1.1 Construire un flipper', '1');
  const competenceDauphin = _createCompetence('competenceRecordIdTwo', '1.2', '1.2 Adopter un dauphin', '1');
  const competenceRequin = _createCompetence('competenceRecordIdThree', '1.3', '1.3 Se faire manger par un requin', '1');

  const challengeForSkillCollaborer4 = _createChallenge('challengeRecordIdThree', 'competenceRecordIdThatDoesNotExistAnymore', [skillCollaborer4], '@collaborer4');

  const challengeForSkillCitation4 = _createChallenge('challengeRecordIdOne', competenceFlipper.id, [skillCitation4], '@citation4');
  const challengeForSkillCitation4AndMoteur3 = _createChallenge('challengeRecordIdTwo', competenceFlipper.id, [skillCitation4, skillMoteur3], '@citation4');
  const challengeForSkillRecherche4 = _createChallenge('challengeRecordIdFour', competenceFlipper.id, [skillRecherche4], '@recherche4');
  const challengeRecordWithoutSkills = _createChallenge('challengeRecordIdNine', competenceFlipper.id, [], null);
  const anotherChallengeForSkillCitation4 = _createChallenge('challengeRecordIdTen', competenceFlipper.id, [skillCitation4], '@citation4');

  const challengeForSkillRemplir2 = _createChallenge('challengeRecordIdFive', competenceDauphin.id, [skillRemplir2], '@remplir2');
  const challengeForSkillRemplir4 = _createChallenge('challengeRecordIdSix', competenceDauphin.id, [skillRemplir4], '@remplir4');
  const challengeForSkillUrl3 = _createChallenge('challengeRecordIdSeven', competenceDauphin.id, [skillUrl3], '@url3');
  const challengeForSkillWeb1 = _createChallenge('challengeRecordIdEight', competenceDauphin.id, [skillWeb1], '@web1');

  const challengeForSkillRequin5 = _createChallenge('challengeRecordIdNine', competenceRequin.id, [skillRequin5], '@requin5');
  const challengeForSkillRequin8 = _createChallenge('challengeRecordIdTen', competenceRequin.id, [skillRequin8], '@requin8');

  const competences = [
    competenceFlipper,
    competenceDauphin,
    competenceRequin,
  ];

  beforeEach(() => {
    sinon.stub(challengeRepository, 'findOperative').resolves([
      challengeForSkillCitation4,
      anotherChallengeForSkillCitation4,
      challengeForSkillCitation4AndMoteur3,
      challengeForSkillCollaborer4,
      challengeForSkillRecherche4,
      challengeForSkillRemplir2,
      challengeForSkillRemplir4,
      challengeForSkillUrl3,
      challengeForSkillWeb1,
      challengeRecordWithoutSkills,
      challengeForSkillRequin5,
      challengeForSkillRequin8,
    ]);
    sinon.stub(competenceRepository, 'listPixCompetencesOnly').resolves(competences);
    sinon.stub(skillRepository, 'list').resolves([
      skillCitation4,
      skillCollaborer4,
      skillMoteur3,
      skillRecherche4,
      skillRemplir2,
      skillRemplir4,
      skillRequin5,
      skillRequin8,
      skillUrl3,
      skillWeb1,
    ]);
  });

  context('V1 Profile', () => {
    describe('#getPlacementProfile', () => {

      const assessmentResult1 = new AssessmentResult({ level: 1, pixScore: 12 });
      const assessmentResult2 = new AssessmentResult({ level: 2, pixScore: 23 });
      const assessmentResult3 = new AssessmentResult({ level: 0, pixScore: 2 });
      const assessment1 = new Assessment({
        id: 13,
        status: 'completed',
        competenceId: 'competenceRecordIdOne',
        assessmentResults: [assessmentResult1],
      });
      const assessment2 = new Assessment({
        id: 1637,
        status: 'completed',
        competenceId: 'competenceRecordIdTwo',
        assessmentResults: [assessmentResult2],
      });
      const assessment3 = new Assessment({
        id: 145,
        status: 'completed',
        competenceId: 'competenceRecordIdUnknown',
        assessmentResults: [assessmentResult3],
      });

      beforeEach(() => {
        sinon.stub(assessmentRepository, 'findLastCompletedAssessmentsForEachCompetenceByUser').resolves([
          assessment1, assessment2, assessment3,
        ]);
      });

      it('should load achieved assessments', async () => {
        // given
        const limitDate = '2020-10-27 08:44:25';

        // when
        await placementProfileService.getPlacementProfile({ userId, limitDate, isV2Certification: false });

        // then
        sinon.assert.calledOnce(assessmentRepository.findLastCompletedAssessmentsForEachCompetenceByUser);
        sinon.assert.calledWith(assessmentRepository.findLastCompletedAssessmentsForEachCompetenceByUser, userId, '2020-10-27 08:44:25');
      });
    });
  });

  context('V2 Profile', () => {
    describe('#getPlacementProfile', () => {

      it('should assign 0 pixScore and level of 0 to user competence when not assessed', async () => {
        // given
        sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
          .withArgs({ userId, limitDate: sinon.match.any }).resolves({});

        // when
        const actualPlacementProfile = await placementProfileService.getPlacementProfile({
          userId,
          limitDate: 'salut',
        });

        // then
        expect(actualPlacementProfile.userCompetences).to.deep.equal([
          {
            id: 'competenceRecordIdOne',
            index: '1.1',
            area: { code: '1' },
            name: '1.1 Construire un flipper',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          },
          {
            id: 'competenceRecordIdTwo',
            index: '1.2',
            area: { code: '1' },
            name: '1.2 Adopter un dauphin',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          },
          {
            id: 'competenceRecordIdThree',
            index: '1.3',
            area: { code: '1' },
            name: '1.3 Se faire manger par un requin',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
          }]);
      });

      describe('PixScore by competences', () => {

        it('should assign pixScore and level to user competence based on knowledge elements', async () => {
          // given

          const ke = domainBuilder.buildKnowledgeElement({
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir2.id,
            earnedPix: 23,
          });

          sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
            .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdTwo: [ke] });

          // when
          const actualPlacementProfile = await placementProfileService.getPlacementProfile({
            userId,
            limitDate: 'salut',
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
            skills: [skillRemplir2],
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
          const inferredKe = domainBuilder.buildKnowledgeElement({
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir2.id,
            earnedPix: 8,
            source: KnowledgeElement.SourceType.INFERRED,
          });

          const directKe = domainBuilder.buildKnowledgeElement({
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir4.id,
            earnedPix: 9,
            source: KnowledgeElement.SourceType.DIRECT,
          });

          sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
            .withArgs({
              userId,
              limitDate: sinon.match.any,
            }).resolves({ 'competenceRecordIdTwo': [inferredKe, directKe] });

          // when
          const actualPlacementProfile = await placementProfileService.getPlacementProfile({
            userId,
            limitDate: 'salut',
          });

          // then
          expect(actualPlacementProfile.userCompetences[1].pixScore).to.equal(17);
        });

        context('when we dont want to limit pix score', () => {
          it('should not limit pixScore and level to the max reachable for user competence based on knowledge elements', async () => {

            const ke = domainBuilder.buildKnowledgeElement({
              competenceId: 'competenceRecordIdOne',
              earnedPix: 64,
            });

            sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
              .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdOne: [ke] });

            // when
            const actualPlacementProfile = await placementProfileService.getPlacementProfile({
              userId,
              limitDate: 'salut',
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

            const ke = domainBuilder.buildKnowledgeElement({
              competenceId: 'competenceRecordIdOne',
              earnedPix: 64,
            });

            sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
              .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdOne: [ke] });

            // when
            const actualPlacementProfile = await placementProfileService.getPlacementProfile({
              userId,
              limitDate: 'salut',
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

          const kePointingToExistingSkill = domainBuilder.buildKnowledgeElement({
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir2.id,
            earnedPix: 11,
          });

          const kePointingToMissingSkill = domainBuilder.buildKnowledgeElement({
            competenceId: 'competenceRecordIdTwo',
            skillId: 'missing skill id',
            earnedPix: 11,
          });

          sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
            .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdTwo: [
              kePointingToExistingSkill, kePointingToMissingSkill] });

          // when
          const actualPlacementProfile = await placementProfileService.getPlacementProfile({
            userId,
            limitDate: 'salut',
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
            skills: [skillRemplir2],
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

    it('should assign 0 pixScore and level of 0 to user competence when not assessed', async () => {
      // given
      sinon.stub(knowledgeElementRepository, 'findSnapshotGroupedByCompetencesForUsers')
        .withArgs({ [userId]: sinon.match.any }).resolves({ [userId]: {} });

      // when
      const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
        userIdsAndDates: { [userId]: 'someLimitDate' },
        competences,
      });

      // then
      expect(actualPlacementProfiles[0].userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          area: { code: '1' },
          name: '1.1 Construire un flipper',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { code: '1' },
          name: '1.2 Adopter un dauphin',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
        },
        {
          id: 'competenceRecordIdThree',
          index: '1.3',
          area: { code: '1' },
          name: '1.3 Se faire manger par un requin',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
        }]);
    });

    describe('PixScore by competences', () => {

      it('should assign pixScore and level to user competence based on knowledge elements', async () => {
        // given
        const ke = domainBuilder.buildKnowledgeElement({
          competenceId: 'competenceRecordIdTwo',
          skillId: skillRemplir2.id,
          earnedPix: 23,
        });

        sinon.stub(knowledgeElementRepository, 'findSnapshotGroupedByCompetencesForUsers')
          .withArgs({ [userId]: sinon.match.any }).resolves({ [userId]: { competenceRecordIdTwo: [ke] } });

        // when
        const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
          userIdsAndDates: { [userId]: 'someLimitDate' },
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
        const inferredKe = domainBuilder.buildKnowledgeElement({
          competenceId: 'competenceRecordIdTwo',
          skillId: skillRemplir2.id,
          earnedPix: 8,
          source: KnowledgeElement.SourceType.INFERRED,
        });

        const directKe = domainBuilder.buildKnowledgeElement({
          competenceId: 'competenceRecordIdTwo',
          skillId: skillRemplir4.id,
          earnedPix: 9,
          source: KnowledgeElement.SourceType.DIRECT,
        });

        sinon.stub(knowledgeElementRepository, 'findSnapshotGroupedByCompetencesForUsers')
          .withArgs({ [userId]: sinon.match.any }).resolves({ [userId]: { 'competenceRecordIdTwo': [inferredKe, directKe] } });

        // when
        const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
          userIdsAndDates: { [userId]: 'someLimitDate' },
          competences,
        });

        // then
        expect(actualPlacementProfiles[0].userCompetences[1].pixScore).to.equal(17);
      });

      context('when we dont want to limit pix score', () => {
        it('should not limit pixScore and level to the max reachable for user competence based on knowledge elements', async () => {
          const ke = domainBuilder.buildKnowledgeElement({
            competenceId: 'competenceRecordIdOne',
            earnedPix: 64,
          });

          sinon.stub(knowledgeElementRepository, 'findSnapshotGroupedByCompetencesForUsers')
            .withArgs({ [userId]: sinon.match.any }).resolves({ [userId]: { competenceRecordIdOne: [ke] } });

          // when
          const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
            userIdsAndDates: { [userId]: 'someLimitDate' },
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
          const ke = domainBuilder.buildKnowledgeElement({
            competenceId: 'competenceRecordIdOne',
            earnedPix: 64,
          });

          sinon.stub(knowledgeElementRepository, 'findSnapshotGroupedByCompetencesForUsers')
            .withArgs({ [userId]: sinon.match.any }).resolves({ [userId]: { competenceRecordIdOne: [ke] } });

          // when
          const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
            userIdsAndDates: { [userId]: 'someLimitDate' },
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
