const { expect, sinon, domainBuilder } = require('../../../test-helper');
const _ = require('lodash');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const userService = require('../../../../lib/domain/services/user-service');

const Answer = require('../../../../lib/domain/models/Answer');
const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const CertificationProfile = require('../../../../lib/domain/models/CertificationProfile');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Competence = require('../../../../lib/domain/models/Competence');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const Skill = require('../../../../lib/domain/models/Skill');
const UserCompetence = require('../../../../lib/domain/models/UserCompetence');

describe('Integration | Service | User Service | #getCertificationProfile', function() {

  const userId = 63731;

  const answerCollectionWithEmptyData = [];

  function _createCompetence(id, index, name, areaCode) {
    const competence = new Competence();
    competence.id = id;
    competence.index = index;
    competence.name = name;
    competence.area = { code: areaCode };

    return competence;
  }

  function _createChallenge(id, competence, skills, testedSkill, status = 'validé') {
    const challenge = Challenge.fromAttributes();
    challenge.id = id;
    challenge.skills = skills;
    challenge.competenceId = competence;
    challenge.testedSkill = testedSkill;
    challenge.status = status;
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
  const skillSearch1 = new Skill({ id: 90, name: '@url1' });
  const skillWithoutChallenge = new Skill({ id: 100, name: '@oldSKill8' });

  const competenceFlipper = _createCompetence('competenceRecordIdOne', '1.1', '1.1 Construire un flipper', '1');
  const competenceDauphin = _createCompetence('competenceRecordIdTwo', '1.2', '1.2 Adopter un dauphin', '1');

  const challengeForSkillCollaborer4 = _createChallenge('challengeRecordIdThree', 'competenceRecordIdThatDoesNotExistAnymore', [skillCollaborer4], '@collaborer4');

  const challengeForSkillCitation4 = _createChallenge('challengeRecordIdOne', competenceFlipper.id, [skillCitation4], '@citation4');
  const challengeForSkillCitation4AndMoteur3 = _createChallenge('challengeRecordIdTwo', competenceFlipper.id, [skillCitation4, skillMoteur3], '@citation4');
  const challengeForSkillRecherche4 = _createChallenge('challengeRecordIdFour', competenceFlipper.id, [skillRecherche4], '@recherche4');
  const challengeRecordWithoutSkills = _createChallenge('challengeRecordIdNine', competenceFlipper.id, [], null);
  const archivedChallengeForSkillCitation4 = _createChallenge('challengeRecordIdTen', competenceFlipper.id, [skillCitation4], '@citation4', 'archive');
  const oldChallengeWithAlreadyValidatedSkill = _createChallenge('challengeRecordIdEleven', competenceFlipper.id, [skillWithoutChallenge], '@oldSkill8', 'proposé');
  const challengeForSkillSearch1 = _createChallenge('challenge_url1', competenceFlipper.id, [skillSearch1], '@search1');
  const challenge2ForSkillSearch1 = _createChallenge('challenge_bis_url1', competenceFlipper.id, [skillSearch1], '@search1');

  const challengeForSkillRemplir2 = _createChallenge('challengeRecordIdFive', competenceDauphin.id, [skillRemplir2], '@remplir2');
  const challengeForSkillRemplir4 = _createChallenge('challengeRecordIdSix', competenceDauphin.id, [skillRemplir4], '@remplir4');
  const challengeForSkillUrl3 = _createChallenge('challengeRecordIdSeven', competenceDauphin.id, [skillUrl3], '@url3');
  const challengeForSkillWeb1 = _createChallenge('challengeRecordIdEight', competenceDauphin.id, [skillWeb1], '@web1');

  beforeEach(() => {
    sinon.stub(courseRepository, 'getAdaptiveCourses').resolves([
      { competences: ['competenceRecordIdOne'], id: 'courseId1' },
      { competences: ['competenceRecordIdTwo'], id: 'courseId2' },
    ]);
    sinon.stub(challengeRepository, 'list').resolves([
      challengeForSkillCitation4,
      archivedChallengeForSkillCitation4,
      challengeForSkillCitation4AndMoteur3,
      challengeForSkillCollaborer4,
      challengeForSkillRecherche4,
      challengeForSkillRemplir2,
      challengeForSkillRemplir4,
      challengeForSkillUrl3,
      challengeForSkillWeb1,
      challengeRecordWithoutSkills,
      oldChallengeWithAlreadyValidatedSkill
    ]);
    sinon.stub(competenceRepository, 'listPixCompetencesOnly').resolves([
      competenceFlipper,
      competenceDauphin
    ]);
  });

  context('V1 Profile', () => {
    describe('#getCertificationProfile', () => {

      const assessmentResult1 = new AssessmentResult({ level: 1, pixScore: 12 });
      const assessmentResult2 = new AssessmentResult({ level: 2, pixScore: 23 });
      const assessmentResult3 = new AssessmentResult({ level: 0, pixScore: 2 });
      const assessment1 = Assessment.fromAttributes({
        id: 13,
        status: 'completed',
        courseId: 'courseId1',
        assessmentResults: [assessmentResult1]
      });
      const assessment2 = Assessment.fromAttributes({
        id: 1637,
        status: 'completed',
        courseId: 'courseId2',
        assessmentResults: [assessmentResult2]
      });
      const assessment3 = Assessment.fromAttributes({
        id: 145,
        status: 'completed',
        courseId: 'courseId3',
        assessmentResults: [assessmentResult3]
      });

      beforeEach(() => {
        sinon.stub(assessmentRepository, 'findLastCompletedAssessmentsForEachCoursesByUser').resolves([
          assessment1, assessment2, assessment3
        ]);
        sinon.stub(answerRepository, 'findCorrectAnswersByAssessmentId').resolves(answerCollectionWithEmptyData);
      });

      it('should load achieved assessments', async () => {
        // given
        const limitDate = '2020-10-27 08:44:25';

        // when
        await userService.getCertificationProfile({ userId, limitDate, isV2Certification: false });

        // then
        sinon.assert.calledOnce(assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser);
        sinon.assert.calledWith(assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser, userId, '2020-10-27 08:44:25');
      });

      it('should list available competences', async () => {
        // when
        await userService.getCertificationProfile({ userId, isV2Certification: false });

        // then
        sinon.assert.calledOnce(competenceRepository.listPixCompetencesOnly);
      });

      it('should return the appropriate challenge IDS depending on answers', async () => {
        // given
        const answerA1 = new Answer({ challengeId: challengeForSkillRecherche4.id, result: 'ok' });
        const answerCollectionA = [answerA1];

        const answerB1 = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answerB2 = new Answer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
        const answerCollectionB = [answerB1, answerB2];

        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionA);
        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionB);

        // when
        const actualCertificationProfile = await userService.getCertificationProfile({ userId, isV2Certification: false });

        // then
        expect(actualCertificationProfile.challengeIdsCorrectlyAnswered)
          .to.deep.equal(['challengeRecordIdFour', 'challengeRecordIdFive', 'challengeRecordIdSeven']);
      });
    });
  });

  context('V2 Profile', () => {
    describe('#getCertificationProfile', () => {

      let answerRepositoryFindChallengeIds;

      beforeEach(() => {
        answerRepositoryFindChallengeIds = sinon.stub(answerRepository, 'findChallengeIdsFromAnswerIds');
        answerRepositoryFindChallengeIds.resolves([]);
      });

      it('should assign 0 pixScore and level of 0 to user competence when not assessed', async () => {
        // given
        sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
          .withArgs({ userId, limitDate: sinon.match.any }).resolves({});

        // when
        const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'salut' });

        // then
        expect(actualCertificationProfile.userCompetences).to.deep.equal([
          {
            id: 'competenceRecordIdOne',
            index: '1.1',
            area: { code: '1' },
            name: '1.1 Construire un flipper',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
            challenges: []
          },
          {
            id: 'competenceRecordIdTwo',
            index: '1.2',
            area: { code: '1' },
            name: '1.2 Adopter un dauphin',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
            challenges: []
          }]);
      });

      describe('PixScore by competences', () => {

        it('should assign pixScore and level to user competence based on knowledge elements', async () => {
          // given
          const answer = new Answer({ id: 1, challengeId: challengeForSkillRemplir2.id, result: 'ok' });

          const ke = domainBuilder.buildKnowledgeElement({
            answerId: answer.id,
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir2.id,
            earnedPix: 23
          });

          sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
            .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdTwo: [ke] });

          // when
          const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'salut' });

          // then
          expect(actualCertificationProfile.userCompetences[0]).to.include({ id: 'competenceRecordIdOne', pixScore: 0, estimatedLevel: 0 });
          expect(actualCertificationProfile.userCompetences[1]).to.include({ id: 'competenceRecordIdTwo', pixScore: 23, estimatedLevel: 2, });
        });

        it('should include both inferred and direct KnowlegdeElements to compute PixScore', async () => {
          // given
          const answer = new Answer({ id: 1, challengeId: challengeForSkillRemplir4.id, result: 'ok' });
          answerRepositoryFindChallengeIds.withArgs([1]).resolves([answer.challengeId]);

          const inferredKe = domainBuilder.buildKnowledgeElement({
            answerId: answer.id,
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir2.id,
            earnedPix: 8,
            source: KnowledgeElement.SourceType.INFERRED
          });

          const directKe = domainBuilder.buildKnowledgeElement({
            answerId: answer.id,
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir4.id,
            earnedPix: 9,
            source: KnowledgeElement.SourceType.DIRECT
          });

          sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
            .withArgs({
              userId,
              limitDate: sinon.match.any
            }).resolves({ 'competenceRecordIdTwo': [inferredKe, directKe] });

          // when
          const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'salut' });

          // then
          expect(actualCertificationProfile.userCompetences[1].pixScore).to.equal(17);
        });
      });

      it('should include only correctly answered challenges from direct validated KnowlegdeElements', async () => {
        // given
        const answer = new Answer({ id: 1, challengeId: challengeForSkillRemplir4.id, result: 'ok' });
        answerRepositoryFindChallengeIds.withArgs([answer.id]).resolves([answer.challengeId]);

        const inferredKe = domainBuilder.buildKnowledgeElement({
          userId,
          answerId: answer.id,
          competenceId: 'competenceRecordIdTwo',
          skillId: skillRemplir2.id,
          earnedPix: 8,
          source: KnowledgeElement.SourceType.INFERRED
        });

        const directKe = domainBuilder.buildKnowledgeElement({
          userId,
          answerId: answer.id,
          competenceId: 'competenceRecordIdTwo',
          skillId: skillRemplir4.id,
          earnedPix: 9,
          source: KnowledgeElement.SourceType.DIRECT
        });

        sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
          .withArgs({
            userId,
            limitDate: sinon.match.any
          }).resolves({ 'competenceRecordIdTwo': [inferredKe, directKe] });

        // when
        const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'salut' });

        // then
        expect(actualCertificationProfile.challengeIdsCorrectlyAnswered)
          .to.deep.equal(['challengeRecordIdSix']);
      });

      it('should include only correctly answered challenges from validated KnowlegdeElements', async () => {
        // given
        const okAnswer = new Answer({ id: 1, challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const koAnswer = new Answer({ id: 2, challengeId: challengeForSkillRemplir4.id, result: 'ko' });

        const validatedKE = domainBuilder.buildKnowledgeElement({
          userId,
          answerId: okAnswer.id,
          competenceId: 'competenceRecordIdTwo',
          skillId: skillRemplir2.id,
          earnedPix: 8,
          source: KnowledgeElement.SourceType.DIRECT,
          status: KnowledgeElement.StatusType.VALIDATED,
        });

        const invalidatedKe = domainBuilder.buildKnowledgeElement({
          userId,
          answerId: koAnswer.id,
          competenceId: 'competenceRecordIdTwo',
          skillId: skillRemplir4.id,
          earnedPix: 0,
          source: KnowledgeElement.SourceType.DIRECT,
          status: KnowledgeElement.StatusType.INVALIDATED,
        });

        sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
          .withArgs({
            userId,
            limitDate: sinon.match.any
          }).resolves({ 'competenceRecordIdTwo': [validatedKE, invalidatedKe] });

        answerRepositoryFindChallengeIds.withArgs([okAnswer.id]).resolves([okAnswer.challengeId]);

        // when
        const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'salut' });

        // then
        expect(actualCertificationProfile.challengeIdsCorrectlyAnswered)
          .to.deep.equal(['challengeRecordIdFive']);
      });

      it('should return the appropriate challenge IDS depending on KE', async () => {
        // given
        const answerA1 = new Answer({ id: 123, challengeId: challengeForSkillRecherche4.id, result: 'ok' });
        const answerCollectionA = [answerA1];

        const answerB1 = new Answer({ id: 456, challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answerB2 = new Answer({ id: 789, challengeId: challengeForSkillUrl3.id, result: 'ok' });
        const answerCollectionB = [answerB1, answerB2];

        answerRepository.findChallengeIdsFromAnswerIds
          .withArgs(_.map(answerCollectionA.concat(answerCollectionB), 'id'))
          .resolves([challengeForSkillRecherche4.id, challengeForSkillRemplir2.id, challengeForSkillUrl3.id]);

        const ke = domainBuilder.buildKnowledgeElement({
          answerId: answerA1.id,
          competenceId: 'competenceRecordIdOne',
          skillId: skillRecherche4.id,
          earnedPix: 12
        });

        const ke2 = domainBuilder.buildKnowledgeElement({
          answerId: answerB1.id,
          competenceId: 'competenceRecordIdTwo',
          skillId: skillRemplir2.id,
          earnedPix: 4
        });

        const ke3 = domainBuilder.buildKnowledgeElement({
          answerId: answerB2.id,
          competenceId: 'competenceRecordIdTwo',
          skillId: skillUrl3.id,
          earnedPix: 4
        });

        sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
          .withArgs({ userId, limitDate: sinon.match.any })
          .resolves({ competenceRecordIdOne: [ke], competenceRecordIdTwo: [ke2, ke3] });

        // when
        const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'date' });

        // then
        expect(actualCertificationProfile.challengeIdsCorrectlyAnswered)
          .to.deep.equal(['challengeRecordIdFour', 'challengeRecordIdFive', 'challengeRecordIdSeven']);
      });
    });
  });

  describe('#fillCertificationProfileWithCertificationChallenges', () => {
    let certificationProfile;
    let userCompetence1;
    let userCompetence2;

    beforeEach(() => {
      userCompetence1 = new UserCompetence({
        id: 'competenceRecordIdOne',
        index: '1.1',
        area: { code: '1' },
        name: '1.1 Construire un flipper',
      });
      userCompetence1.pixScore = 12;
      userCompetence1.estimatedLevel = 1;
      userCompetence2 = new UserCompetence({
        id: 'competenceRecordIdTwo',
        index: '1.2',
        area: { code: '1' },
        name: '1.2 Adopter un dauphin',
      });
      userCompetence2.pixScore = 23;
      userCompetence2.estimatedLevel = 2;
      certificationProfile = new CertificationProfile({
        userId,
        userCompetences: [],
        challengeIdsCorrectlyAnswered: [],
      });
    });

    it('should list available challenges', async () => {
      // when
      await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

      // then
      sinon.assert.calledOnce(challengeRepository.list);
    });

    it('should assign skill to related competence', async () => {
      // given
      certificationProfile.userCompetences = [userCompetence2];
      certificationProfile.challengeIdsCorrectlyAnswered = ['challengeRecordIdFive'];

      // when
      const actualCertificationProfile = await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

      // then
      expect(actualCertificationProfile.userCompetences).to.deep.equal([
        {
          ...certificationProfile.userCompetences[0],
          skills: [skillRemplir2],
          challenges: [challengeForSkillRemplir2]
        }]);
    });

    context('when competence level is less than 1', () => {

      it('should select no challenge', async () => {
        // given
        userCompetence1.estimatedLevel = 0;
        certificationProfile.userCompetences = [userCompetence1];
        certificationProfile.challengeIdsCorrectlyAnswered = [];

        // when
        const actualCertificationProfile = await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

        // then
        expect(actualCertificationProfile.userCompetences).to.deep.equal([
          {
            ...certificationProfile.userCompetences[0],
            skills: [],
            challenges: []
          }]);
      });
    });

    context('when no challenge validate the skill', () => {

      it('should not return the skill', async () => {
        // given
        certificationProfile.userCompetences = [userCompetence2];
        certificationProfile.challengeIdsCorrectlyAnswered = ['challengeRecordIdEleven'];

        // when
        const actualCertificationProfile = await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

        // then
        expect(actualCertificationProfile.userCompetences).to.deep.equal([
          {
            ...certificationProfile.userCompetences[0],
            skills: [],
            challenges: []
          }]);
      });
    });

    context('when three challenges validate the same skill', () => {

      it('should select the unanswered challenge which is published', async () => {
        // given
        certificationProfile.userCompetences = [userCompetence1];
        certificationProfile.challengeIdsCorrectlyAnswered = ['challengeRecordIdOne'];

        // when
        const actualCertificationProfile = await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

        // then
        expect(actualCertificationProfile.userCompetences).to.deep.equal([
          {
            ...certificationProfile.userCompetences[0],
            skills: [skillCitation4],
            challenges: [challengeForSkillCitation4AndMoteur3],
          }]);
      });

      it('should select a challenge for every skill', async () => {
        // given
        certificationProfile.userCompetences = [userCompetence1];
        certificationProfile.challengeIdsCorrectlyAnswered =
          ['challengeRecordIdFour', 'challengeRecordIdTwo'];

        // when
        const actualCertificationProfile = await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

        // then
        expect(actualCertificationProfile.userCompetences).to.deep.equal([
          {
            ...certificationProfile.userCompetences[0],
            skills: [skillCitation4, skillRecherche4, skillMoteur3],
            challenges: [challengeForSkillCitation4, challengeForSkillRecherche4, challengeForSkillCitation4AndMoteur3]
          },
        ]);
      });
    });

    it('should group skills by competence ', async () => {
      // given
      certificationProfile.userCompetences = [userCompetence1, userCompetence2];
      certificationProfile.challengeIdsCorrectlyAnswered =
        ['challengeRecordIdFour', 'challengeRecordIdFive', 'challengeRecordIdSeven'];
      // when
      const actualCertificationProfile = await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

      // then
      expect(actualCertificationProfile.userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          area: { code: '1' },
          name: '1.1 Construire un flipper',
          skills: [skillRecherche4],
          pixScore: 12,
          estimatedLevel: 1,
          challenges: [challengeForSkillRecherche4]
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { code: '1' },
          name: '1.2 Adopter un dauphin',
          skills: [skillUrl3, skillRemplir2],
          pixScore: 23,
          estimatedLevel: 2,
          challenges: [challengeForSkillUrl3, challengeForSkillRemplir2]
        }]);
    });

    it('should sort in desc grouped skills by competence', async () => {
      // given
      certificationProfile.userCompetences = [userCompetence1, userCompetence2];
      certificationProfile.challengeIdsCorrectlyAnswered =
        ['challengeRecordIdSix', 'challengeRecordIdFive', 'challengeRecordIdSeven'];
      // when
      const actualCertificationProfile = await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

      // then
      expect(actualCertificationProfile.userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          area: { code: '1' },
          name: '1.1 Construire un flipper',
          skills: [],
          pixScore: 12,
          estimatedLevel: 1,
          challenges: [],
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { code: '1' },
          name: '1.2 Adopter un dauphin',
          skills: [skillRemplir4, skillUrl3, skillRemplir2],
          pixScore: 23,
          estimatedLevel: 2,
          challenges: [challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2],
        }]);
    });

    it('should return the three most difficult skills sorted in desc grouped by competence', async () => {
      // given
      certificationProfile.userCompetences = [userCompetence1, userCompetence2];
      certificationProfile.challengeIdsCorrectlyAnswered =
        ['challengeRecordIdSix', 'challengeRecordIdFive', 'challengeRecordIdSeven', 'challengeRecordIdEight'];
      // when
      const actualCertificationProfile = await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

      // then
      expect(actualCertificationProfile.userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          area: { code: '1' },
          name: '1.1 Construire un flipper',
          skills: [],
          pixScore: 12,
          estimatedLevel: 1,
          challenges: [],
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { code: '1' },
          name: '1.2 Adopter un dauphin',
          skills: [skillRemplir4, skillUrl3, skillRemplir2],
          pixScore: 23,
          estimatedLevel: 2,
          challenges: [challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2],
        }]);
    });

    it('should not add a skill twice', async () => {
      // given
      certificationProfile.userCompetences = [userCompetence1, userCompetence2];
      certificationProfile.challengeIdsCorrectlyAnswered = ['challengeRecordIdFive', 'challengeRecordIdFive'];
      // when
      const actualCertificationProfile = await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

      // then
      expect(actualCertificationProfile.userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          area: { code: '1' },
          name: '1.1 Construire un flipper',
          skills: [],
          pixScore: 12,
          estimatedLevel: 1,
          challenges: [],
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { code: '1' },
          name: '1.2 Adopter un dauphin',
          skills: [skillRemplir2],
          pixScore: 23,
          estimatedLevel: 2,
          challenges: [challengeForSkillRemplir2],
        }]);
    });

    it('should not assign skill, when the challenge id is not found', async () => {
      // given
      certificationProfile.userCompetences = [userCompetence1, userCompetence2];
      certificationProfile.challengeIdsCorrectlyAnswered = ['nonExistentchallengeRecordId'];
      // when
      const actualCertificationProfile = await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

      // then
      expect(actualCertificationProfile.userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          area: { code: '1' },
          name: '1.1 Construire un flipper',
          skills: [],
          pixScore: 12,
          estimatedLevel: 1,
          challenges: [],
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { code: '1' },
          name: '1.2 Adopter un dauphin',
          skills: [],
          pixScore: 23,
          estimatedLevel: 2,
          challenges: [],
        }]);
    });

    it('should not assign skill, when the competence is not found', async () => {
      // given
      certificationProfile.userCompetences = [userCompetence1, userCompetence2];
      certificationProfile.challengeIdsCorrectlyAnswered = ['challengeRecordIdThree'];
      // when
      const actualCertificationProfile = await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

      // then
      expect(actualCertificationProfile.userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          area: { code: '1' },
          name: '1.1 Construire un flipper',
          skills: [],
          pixScore: 12,
          estimatedLevel: 1,
          challenges: [],
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { code: '1' },
          name: '1.2 Adopter un dauphin',
          skills: [],
          pixScore: 23,
          estimatedLevel: 2,
          challenges: [],
        }]);
    });

    context('when competence has no challenge which validated two skills', () => {

      it('should return three challenges by competence', async () => {
        // given
        certificationProfile.userCompetences = [userCompetence1, userCompetence2];
        certificationProfile.challengeIdsCorrectlyAnswered =
          ['challengeRecordIdSix', 'challengeRecordIdFive', 'challengeRecordIdSeven', 'challengeRecordIdEight'];
        // when
        const actualCertificationProfile = await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

        // then
        expect(actualCertificationProfile.userCompetences[1].skills)
          .to.have.members([skillRemplir4, skillUrl3, skillRemplir2]);
        expect(actualCertificationProfile.userCompetences[1].challenges)
          .to.have.members([challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2]);
      });
    });

    context('when competence has challenge which validated two skills', () => {

      it('should return three challenges by competence', async () => {
        // given
        certificationProfile.userCompetences = [userCompetence1, userCompetence2];
        certificationProfile.challengeIdsCorrectlyAnswered =
          ['challengeRecordIdFour', 'challengeRecordIdTwo', 'challenge_url1'];
        challengeRepository.list.resolves([
          challengeForSkillRecherche4,
          challengeForSkillCitation4AndMoteur3,
          challengeForSkillCollaborer4,
          challengeForSkillSearch1,
          challenge2ForSkillSearch1,
        ]);
        // when
        const actualCertificationProfile = await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

        // then
        expect(actualCertificationProfile.userCompetences[0].skills)
          .to.have.members([skillCitation4, skillRecherche4, skillMoteur3, skillSearch1]);
        expect(actualCertificationProfile.userCompetences[0].challenges)
          .to.have.members([challengeForSkillCitation4AndMoteur3, challengeForSkillRecherche4, challenge2ForSkillSearch1]);
      });
    });
  });
});
