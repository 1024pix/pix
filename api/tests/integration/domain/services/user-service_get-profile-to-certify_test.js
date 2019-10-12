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
const Challenge = require('../../../../lib/domain/models/Challenge');
const Competence = require('../../../../lib/domain/models/Competence');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const Skill = require('../../../../lib/domain/models/Skill');

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
    sinon.stub(competenceRepository, 'list').resolves([
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

      it('should list available challenges', async () => {
        // when
        await userService.getCertificationProfile({ userId, isV2Certification: false });

        // then
        sinon.assert.calledOnce(challengeRepository.list);
      });

      it('should list available competences', async () => {
        // when
        await userService.getCertificationProfile({ userId, isV2Certification: false });

        // then
        sinon.assert.calledOnce(competenceRepository.list);
      });

      context('when all informations needed are collected', () => {

        it('should assign skill to related competence', async () => {
          // given
          const answer = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
          const answerCollectionWithOneAnswer = [answer];

          answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
          answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionWithOneAnswer);

          // when
          const actualCertificationProfile = await userService.getCertificationProfile({ userId, isV2Certification: false });

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
              challenges: []
            },
            {
              id: 'competenceRecordIdTwo',
              index: '1.2',
              area: { code: '1' },
              name: '1.2 Adopter un dauphin',
              skills: [skillRemplir2],
              pixScore: 23,
              estimatedLevel: 2,
              challenges: [challengeForSkillRemplir2]
            }]);
        });

        context('when selecting challenges to validate the skills per competence', () => {

          context('when competence level is less than 1', () => {

            it('should select no challenge', async () => {
              // given
              competenceRepository.list.resolves([
                competenceFlipper,
              ]);

              const failedAssessment = Assessment.fromAttributes({
                id: 'failed-assessment',
                status: 'completed',
                courseId: 'courseId1',
                assessmentResults: [ new AssessmentResult({ level: 0, pixScore: 2 })]
              });

              answerRepository.findCorrectAnswersByAssessmentId.withArgs(failedAssessment.id).resolves([
                new Answer({ challengeId: challengeForSkillCitation4.id, result: 'ok' })
              ]);

              assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser.resolves([
                failedAssessment
              ]);

              // when
              const actualCertificationProfile = await userService.getCertificationProfile({ userId, isV2Certification: false });

              // then
              expect(actualCertificationProfile.userCompetences).to.deep.equal([
                {
                  id: 'competenceRecordIdOne',
                  index: '1.1',
                  area: { code: '1' },
                  name: '1.1 Construire un flipper',
                  skills: [],
                  pixScore: 2,
                  estimatedLevel: 0,
                  challenges: []
                }]);
            });
          });

          context('when no challenge validate the skill', () => {

            it('should not return the skill', async () => {
              // given
              const answerOfOldChallenge = new Answer({
                challengeId: oldChallengeWithAlreadyValidatedSkill.id,
                result: 'ok'
              });
              const answerCollectionWithOneAnswer = [answerOfOldChallenge];

              answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithOneAnswer);
              answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionWithEmptyData);

              // when
              const actualCertificationProfile = await userService.getCertificationProfile({ userId, isV2Certification: false });

              // then
              expect(actualCertificationProfile.userCompetences).to.deep.equal([{
                id: 'competenceRecordIdOne',
                index: '1.1',
                area: { code: '1' },
                name: '1.1 Construire un flipper',
                pixScore: 12,
                estimatedLevel: 1,
                skills: [],
                challenges: []
              }, {
                id: 'competenceRecordIdTwo',
                index: '1.2',
                area: { code: '1' },
                name: '1.2 Adopter un dauphin',
                pixScore: 23,
                estimatedLevel: 2,
                skills: [],
                challenges: []
              }]);
            });
          });

          context('when only one challenge validate the skill', () => {

            it('should select the same challenge', async () => {
              // given
              const answer = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
              const answerCollectionWithOneAnswer = [answer];

              answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
              answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionWithOneAnswer);

              // when
              const actualCertificationProfile = await userService.getCertificationProfile({ userId, isV2Certification: false });

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
                  challenges: []
                },
                {
                  id: 'competenceRecordIdTwo',
                  index: '1.2',
                  area: { code: '1' },
                  name: '1.2 Adopter un dauphin',
                  skills: [skillRemplir2],
                  pixScore: 23,
                  estimatedLevel: 2,
                  challenges: [challengeForSkillRemplir2]
                }]);
            });
          });

          context('when three challenges validate the same skill', () => {

            it('should select the unanswered challenge which is published', async () => {
              // given
              const answer = new Answer({ challengeId: challengeForSkillCitation4.id, result: 'ok' });
              const answerCollectionWithOneAnswer = [answer];

              answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithOneAnswer);
              answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionWithEmptyData);

              // when
              const actualCertificationProfile = await userService.getCertificationProfile({ userId, isV2Certification: false });

              // then
              expect(actualCertificationProfile.userCompetences).to.deep.equal([
                {
                  id: 'competenceRecordIdOne',
                  index: '1.1',
                  area: { code: '1' },
                  name: '1.1 Construire un flipper',
                  skills: [skillCitation4],
                  pixScore: 12,
                  estimatedLevel: 1,
                  challenges: [challengeForSkillCitation4AndMoteur3]
                },
                {
                  id: 'competenceRecordIdTwo',
                  index: '1.2',
                  area: { code: '1' },
                  name: '1.2 Adopter un dauphin',
                  skills: [],
                  pixScore: 23,
                  estimatedLevel: 2,
                  challenges: []
                }]);
            });

            it('should select a challenge for every skill', async () => {
              // given
              const answer = new Answer({ challengeId: challengeForSkillRecherche4.id, result: 'ok' });
              const answer2 = new Answer({ challengeId: challengeForSkillCitation4AndMoteur3.id, result: 'ok' });
              const answerCollectionWithTwoAnswers = [answer, answer2];

              answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithTwoAnswers);
              answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionWithEmptyData);

              // when
              const actualCertificationProfile = await userService.getCertificationProfile({ userId, isV2Certification: false });

              // then
              expect(actualCertificationProfile.userCompetences).to.deep.equal([
                {
                  id: 'competenceRecordIdOne',
                  index: '1.1',
                  area: { code: '1' },
                  name: '1.1 Construire un flipper',
                  skills: [skillCitation4, skillRecherche4, skillMoteur3],
                  pixScore: 12,
                  estimatedLevel: 1,
                  challenges: [challengeForSkillCitation4, challengeForSkillRecherche4, challengeForSkillCitation4AndMoteur3]
                },
                {
                  id: 'competenceRecordIdTwo',
                  index: '1.2',
                  area: { code: '1' },
                  name: '1.2 Adopter un dauphin',
                  skills: [],
                  pixScore: 23,
                  estimatedLevel: 2,
                  challenges: []
                }]);
            });
          });
        });

        it('should group skills by competence ', async () => {
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
          const answer1 = new Answer({ challengeId: challengeForSkillRemplir4.id, result: 'ok' });
          const answer2 = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
          const answer3 = new Answer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
          const answerCollectionArray = [answer1, answer2, answer3];

          answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
          answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionArray);

          // when
          const actualCertificationProfile = await userService.getCertificationProfile({ userId, isV2Certification: false });

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
              challenges: []
            },
            {
              id: 'competenceRecordIdTwo',
              index: '1.2',
              area: { code: '1' },
              name: '1.2 Adopter un dauphin',
              skills: [skillRemplir4, skillUrl3, skillRemplir2],
              pixScore: 23,
              estimatedLevel: 2,
              challenges: [challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2]
            }
          ]);
        });

        it('should return the three most difficult skills sorted in desc grouped by competence', async () => {
          // given
          const answer1 = new Answer({ challengeId: challengeForSkillRemplir4.id, result: 'ok' });
          const answer2 = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
          const answer3 = new Answer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
          const answer4 = new Answer({ challengeId: challengeForSkillWeb1.id, result: 'ok' });
          const answerCollectionArray = [answer1, answer2, answer3, answer4];

          answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
          answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionArray);

          // when
          const actualCertificationProfile = await userService.getCertificationProfile({ userId, isV2Certification: false });

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
              challenges: []
            },
            {
              id: 'competenceRecordIdTwo',
              index: '1.2',
              area: { code: '1' },
              name: '1.2 Adopter un dauphin',
              skills: [skillRemplir4, skillUrl3, skillRemplir2],
              pixScore: 23,
              estimatedLevel: 2,
              challenges: [challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2]
            }
          ]);
        });

        it('should not add a skill twice', async () => {
          // given
          const answer = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
          const answerCollectionArray = [answer, answer];

          answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
          answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionArray);

          // when
          const actualCertificationProfile = await userService.getCertificationProfile({ userId, isV2Certification: false });

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
              challenges: []
            },
            {
              id: 'competenceRecordIdTwo',
              index: '1.2',
              area: { code: '1' },
              name: '1.2 Adopter un dauphin',
              skills: [skillRemplir2],
              pixScore: 23,
              estimatedLevel: 2,
              challenges: [challengeForSkillRemplir2]
            }]);
        });

        it('should not assign skill, when the challenge id is not found', async () => {
          // given
          const answer = new Answer({ challengeId: 'challengeRecordIdThatDoesNotExist', result: 'ok' });
          const answerCollectionArray = [answer];

          answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
          answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionArray);

          // when
          const actualCertificationProfile = await userService.getCertificationProfile({ userId, isV2Certification: false });

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
              challenges: []
            },
            {
              id: 'competenceRecordIdTwo',
              index: '1.2',
              area: { code: '1' },
              name: '1.2 Adopter un dauphin',
              skills: [],
              pixScore: 23,
              estimatedLevel: 2,
              challenges: []
            }]);
        });

        it('should not assign skill, when the competence is not found', async () => {
          // given
          const answer = new Answer({ challengeId: 'challengeRecordIdThree', result: 'ok' });
          const answerCollectionArray = [answer];

          answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
          answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionArray);

          // when
          const actualCertificationProfile = await userService.getCertificationProfile({ userId, isV2Certification: false });

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
              challenges: []
            },
            {
              id: 'competenceRecordIdTwo',
              index: '1.2',
              area: { code: '1' },
              name: '1.2 Adopter un dauphin',
              skills: [],
              pixScore: 23,
              estimatedLevel: 2,
              challenges: []
            }]);
        });
      });

      describe('should return always three challenge by competence', () => {
        context('when competence has not challenge which validated two skills', () => {

          it('should return three challenges by competence', async () => {
            // given
            const answer1 = new Answer({ challengeId: challengeForSkillRemplir4.id, result: 'ok' });
            const answer2 = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
            const answer3 = new Answer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
            const answer4 = new Answer({ challengeId: challengeForSkillWeb1.id, result: 'ok' });
            const answerCollectionArray = [answer1, answer2, answer3, answer4];

            answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
            answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionArray);

            // when
            const actualCertificationProfile = await userService.getCertificationProfile({ userId, isV2Certification: false });

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
            const answer1 = new Answer({ challengeId: challengeForSkillRecherche4.id, result: 'ok' });
            const answer2 = new Answer({ challengeId: challengeForSkillCitation4AndMoteur3.id, result: 'ok' });
            const answer4 = new Answer({ challengeId: challengeForSkillSearch1.id, result: 'ok' });
            const answerCollectionArray = [answer1, answer2, answer4];

            answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
            answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionArray);
            challengeRepository.list.resolves([
              challengeForSkillRecherche4,
              challengeForSkillCitation4AndMoteur3,
              challengeForSkillCollaborer4,
              challengeForSkillSearch1,
              challenge2ForSkillSearch1,
            ]);

            // when
            const actualCertificationProfile = await userService.getCertificationProfile({ userId, isV2Certification: false });

            // then
            expect(actualCertificationProfile.userCompetences[0].skills)
              .to.have.members([skillCitation4, skillRecherche4, skillMoteur3, skillSearch1]);
            expect(actualCertificationProfile.userCompetences[0].challenges)
              .to.have.members([challengeForSkillCitation4AndMoteur3, challengeForSkillRecherche4, challenge2ForSkillSearch1]);
          });
        });
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

      context('when all informations needed are collected', () => {

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

        context('when there are non-certifiable competences', async() => {
          beforeEach(() => {
            competenceRepository.list.resolves([
              competenceFlipper,
            ]);

            const answerForNonCertifiableCompetence = new Answer({
              id: 333,
              challengeId: challengeForSkillCollaborer4.id,
              result: 'ok'
            });
            const keForNonCertifiableCompetence = domainBuilder.buildKnowledgeElement({
              userId,
              answerId: answerForNonCertifiableCompetence.id,
              competenceId: competenceFlipper.id,
              skillId: skillCollaborer4.id,
              earnedPix: 4,
              source: KnowledgeElement.SourceType.DIRECT
            });

            answerRepository.findChallengeIdsFromAnswerIds
              .withArgs([answerForNonCertifiableCompetence.id])
              .resolves([answerForNonCertifiableCompetence.challengeId]);

            sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
              .withArgs({
                userId,
                limitDate: sinon.match.any
              }).resolves({
              'competenceRecordIdOne': [keForNonCertifiableCompetence],
            });
          });

          it('should exclude challenges from non certifiable competences', async () => {
            // when
            const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'date' });

            // then
            expect(actualCertificationProfile.userCompetences).to.deep.equal([
              {
                id: 'competenceRecordIdOne',
                index: '1.1',
                area: { code: '1' },
                name: '1.1 Construire un flipper',
                skills: [],
                pixScore: 4,
                estimatedLevel: 0,
                challenges: []
              }]
            );
          });
        });

        it('should exclude inferred KnowledgeElements to select challenges', async () => {
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
          expect(actualCertificationProfile.userCompetences[1].challenges).to.deep.equal([challengeForSkillRemplir4]);
        });

        it('should include only validated KnowlegdeElements to select challenges', async () => {
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
          expect(actualCertificationProfile.userCompetences[1].challenges).to.deep.equal([challengeForSkillRemplir2]);
        });

        it('should assign challenge to related competence', async () => {
          // given
          const answer = new Answer({ id: 1, challengeId: challengeForSkillRemplir2.id, result: 'ok' });
          answerRepositoryFindChallengeIds.withArgs([1]).resolves([answer.challengeId]);

          const ke = domainBuilder.buildKnowledgeElement({
            answerId: answer.id,
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir2.id,
            earnedPix: 23,
            source: KnowledgeElement.SourceType.DIRECT
          });

          sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
            .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdTwo: [ke] });

          // when
          const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'salut' });

          // then
          expect(actualCertificationProfile.userCompetences[1]).to.deep.include({
            id: 'competenceRecordIdTwo',
            challenges: [challengeForSkillRemplir2]
          });
        });

        context('when selecting challenges to validate the skills per competence', () => {

          context('when no challenge validate the skill', () => {

            it('should not return the skill', async () => {
              // given
              const answerOfOldChallenge = new Answer({
                id: 1,
                challengeId: oldChallengeWithAlreadyValidatedSkill.id,
                result: 'ok'
              });

              answerRepositoryFindChallengeIds.withArgs([answerOfOldChallenge.id])
                .resolves([answerOfOldChallenge.challengeId]);

              const ke = domainBuilder.buildKnowledgeElement({
                answerId: answerOfOldChallenge.id,
                competenceId: 'competenceRecordIdTwo',
                skillId: skillWithoutChallenge.id,
                earnedPix: 23
              });

              sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
                .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdTwo: [ke] });

              // when
              const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'salut' });

              // then
              expect(actualCertificationProfile.userCompetences).to.deep.equal([{
                id: 'competenceRecordIdOne',
                index: '1.1',
                area: { code: '1' },
                name: '1.1 Construire un flipper',
                pixScore: 0,
                estimatedLevel: 0,
                skills: [],
                challenges: []
              }, {
                id: 'competenceRecordIdTwo',
                index: '1.2',
                area: { code: '1' },
                name: '1.2 Adopter un dauphin',
                pixScore: 23,
                estimatedLevel: 2,
                skills: [],
                challenges: []
              }]);
            });
          });

          context('when only one challenge validate the skill', () => {

            it('should select the same challenge', async () => {
              // given
              const answer = new Answer({ id: 12345, challengeId: challengeForSkillRemplir2.id, result: 'ok' });

              answerRepositoryFindChallengeIds.withArgs([answer.id])
                .resolves([answer.challengeId]);

              const ke = domainBuilder.buildKnowledgeElement({
                answerId: answer.id,
                competenceId: 'competenceRecordIdTwo',
                skillId: skillRemplir2.id,
                earnedPix: 23
              });

              sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
                .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdTwo: [ke] });

              // when
              const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'date' });

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
                  skills: [skillRemplir2],
                  pixScore: 23,
                  estimatedLevel: 2,
                  challenges: [challengeForSkillRemplir2]
                }]);
            });
          });

          context('when three challenges validate the same skill', () => {

            it('should select the unanswered challenge which is published', async () => {
              // given
              const answer = new Answer({ id: 12345, challengeId: challengeForSkillCitation4.id, result: 'ok' });

              answerRepositoryFindChallengeIds.withArgs([answer.id])
                .resolves([answer.challengeId]);

              const ke = domainBuilder.buildKnowledgeElement({
                answerId: answer.id,
                competenceId: 'competenceRecordIdOne',
                skillId: skillCitation4.id,
                earnedPix: 12
              });

              sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
                .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdOne: [ke] });

              // when
              const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'date' });

              // then
              expect(actualCertificationProfile.userCompetences).to.deep.equal([
                {
                  id: 'competenceRecordIdOne',
                  index: '1.1',
                  area: { code: '1' },
                  name: '1.1 Construire un flipper',
                  skills: [skillCitation4],
                  pixScore: 12,
                  estimatedLevel: 1,
                  challenges: [challengeForSkillCitation4AndMoteur3]
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

            it('should select a challenge for every skill', async () => {
              // given
              const answer = new Answer({ id: 1234, challengeId: challengeForSkillRecherche4.id, result: 'ok' });
              const answer2 = new Answer({
                id: 5678,
                challengeId: challengeForSkillCitation4AndMoteur3.id,
                result: 'ok'
              });

              answerRepositoryFindChallengeIds.withArgs([answer.id, answer2.id, answer2.id])
                .resolves([answer.challengeId, answer2.challengeId]);

              const ke = domainBuilder.buildKnowledgeElement({
                answerId: answer.id,
                competenceId: 'competenceRecordIdOne',
                skillId: skillRecherche4.id,
                earnedPix: 4
              });

              const ke2 = domainBuilder.buildKnowledgeElement({
                answerId: answer2.id,
                competenceId: 'competenceRecordIdOne',
                skillId: skillCitation4.id,
                earnedPix: 4
              });

              const ke3 = domainBuilder.buildKnowledgeElement({
                answerId: answer2.id,
                competenceId: 'competenceRecordIdOne',
                skillId: skillMoteur3.id,
                earnedPix: 4
              });

              sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
                .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdOne: [ke, ke2, ke3] });

              // when
              const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'date' });

              // then
              expect(actualCertificationProfile.userCompetences).to.deep.equal([
                {
                  id: 'competenceRecordIdOne',
                  index: '1.1',
                  area: { code: '1' },
                  name: '1.1 Construire un flipper',
                  skills: [skillCitation4, skillRecherche4, skillMoteur3],
                  pixScore: 12,
                  estimatedLevel: 1,
                  challenges: [challengeForSkillCitation4, challengeForSkillRecherche4, challengeForSkillCitation4AndMoteur3]
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
          });
        });

        it('should group skills by competence ', async () => {
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
              pixScore: 8,
              estimatedLevel: 1,
              challenges: [challengeForSkillUrl3, challengeForSkillRemplir2]
            }]);
        });

        it('should sort in desc grouped skills by competence', async () => {
          // given
          const answer1 = new Answer({ id: 123, challengeId: challengeForSkillRemplir4.id, result: 'ok' });
          const answer2 = new Answer({ id: 456, challengeId: challengeForSkillRemplir2.id, result: 'ok' });
          const answer3 = new Answer({ id: 789, challengeId: challengeForSkillUrl3.id, result: 'ok' });

          answerRepository.findChallengeIdsFromAnswerIds
            .withArgs([answer1.id, answer2.id, answer3.id])
            .resolves([challengeForSkillRemplir4.id, challengeForSkillRemplir2.id, challengeForSkillUrl3.id]);

          const ke = domainBuilder.buildKnowledgeElement({
            answerId: answer1.id,
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir4.id,
            earnedPix: 12
          });

          const ke2 = domainBuilder.buildKnowledgeElement({
            answerId: answer2.id,
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir2.id,
            earnedPix: 5
          });

          const ke3 = domainBuilder.buildKnowledgeElement({
            answerId: answer3.id,
            competenceId: 'competenceRecordIdTwo',
            skillId: skillUrl3.id,
            earnedPix: 6
          });

          sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
            .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdTwo: [ke, ke2, ke3] });

          // when
          const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'date' });

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
              skills: [skillRemplir4, skillUrl3, skillRemplir2],
              pixScore: 23,
              estimatedLevel: 2,
              challenges: [challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2]
            }
          ]);
        });

        it('should return the three most difficult skills sorted in desc grouped by competence', async () => {
          // given
          const answer1 = new Answer({ id: 12, challengeId: challengeForSkillRemplir4.id, result: 'ok' });
          const answer2 = new Answer({ id: 34, challengeId: challengeForSkillRemplir2.id, result: 'ok' });
          const answer3 = new Answer({ id: 56, challengeId: challengeForSkillUrl3.id, result: 'ok' });
          const answer4 = new Answer({ id: 78, challengeId: challengeForSkillWeb1.id, result: 'ok' });

          answerRepository.findChallengeIdsFromAnswerIds
            .withArgs([answer1.id, answer2.id, answer3.id, answer4.id])
            .resolves([challengeForSkillRemplir4.id, challengeForSkillRemplir2.id, challengeForSkillUrl3.id, challengeForSkillWeb1.id]);

          const ke = domainBuilder.buildKnowledgeElement({
            answerId: answer1.id,
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir4.id,
            earnedPix: 4
          });

          const ke2 = domainBuilder.buildKnowledgeElement({
            answerId: answer2.id,
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir2.id,
            earnedPix: 4
          });

          const ke3 = domainBuilder.buildKnowledgeElement({
            answerId: answer3.id,
            competenceId: 'competenceRecordIdTwo',
            skillId: skillUrl3.id,
            earnedPix: 4
          });

          const ke4 = domainBuilder.buildKnowledgeElement({
            answerId: answer4.id,
            competenceId: 'competenceRecordIdTwo',
            skillId: skillWeb1.id,
            earnedPix: 4
          });

          sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
            .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdTwo: [ke, ke2, ke3, ke4] });

          // when
          const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'date' });

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
              skills: [skillRemplir4, skillUrl3, skillRemplir2],
              pixScore: 16,
              estimatedLevel: 2,
              challenges: [challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2]
            }
          ]);
        });

        it('should not assign skill, when the challenge id is not found', async () => {
          // given
          const answer = new Answer({ id: 123, challengeId: 'challengeRecordIdThatDoesNotExist', result: 'ok' });

          answerRepository.findChallengeIdsFromAnswerIds
            .withArgs([answer.id])
            .resolves([]);

          const ke = domainBuilder.buildKnowledgeElement({
            answerId: answer.id,
            competenceId: 'competenceRecordIdTwo',
            skillId: skillWeb1.id,
            earnedPix: 4
          });

          sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
            .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdTwo: [ke] });

          // when
          const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'date' });

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
              pixScore: 4,
              estimatedLevel: 0,
              challenges: []
            }]);
        });

        it('should not assign skill, when the competence is not found', async () => {
          // given
          const answer = new Answer({ id: 123, challengeId: challengeForSkillCollaborer4.id, result: 'ok' });

          answerRepository.findChallengeIdsFromAnswerIds
            .withArgs([answer.id])
            .resolves([challengeForSkillCollaborer4.id]);

          const ke = domainBuilder.buildKnowledgeElement({
            answerId: answer.id,
            competenceId: 'competenceRecordIdThatDoesNotExistAnymore',
            skillId: skillCollaborer4.id,
            earnedPix: 4
          });

          sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
            .withArgs({
              userId,
              limitDate: sinon.match.any
            }).resolves({ competenceRecordIdThatDoesNotExistAnymore: [ke] });

          // when
          const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'date' });

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
      });

      describe('should return always three challenge by competence', () => {
        context('when competence has not challenge which validated two skills', () => {

          it('should return three challenges by competence', async () => {
            // given
            const answer1 = new Answer({ id: 123, challengeId: challengeForSkillRemplir4.id, result: 'ok' });
            const answer2 = new Answer({ id: 456, challengeId: challengeForSkillRemplir2.id, result: 'ok' });
            const answer3 = new Answer({ id: 789, challengeId: challengeForSkillUrl3.id, result: 'ok' });
            const answer4 = new Answer({ id: 12, challengeId: challengeForSkillWeb1.id, result: 'ok' });

            answerRepository.findChallengeIdsFromAnswerIds
              .withArgs([answer1.id, answer2.id, answer3.id, answer4.id])
              .resolves([challengeForSkillRemplir4.id,
                challengeForSkillRemplir2.id,
                challengeForSkillUrl3.id,
                challengeForSkillWeb1.id
              ]);

            const ke = domainBuilder.buildKnowledgeElement({
              answerId: answer1.id,
              competenceId: 'competenceRecordIdTwo',
              skillId: skillRemplir4.id,
              earnedPix: 4
            });

            const ke2 = domainBuilder.buildKnowledgeElement({
              answerId: answer2.id,
              competenceId: 'competenceRecordIdTwo',
              skillId: skillRemplir2.id,
              earnedPix: 4
            });

            const ke3 = domainBuilder.buildKnowledgeElement({
              answerId: answer3.id,
              competenceId: 'competenceRecordIdTwo',
              skillId: skillUrl3.id,
              earnedPix: 4
            });

            const ke4 = domainBuilder.buildKnowledgeElement({
              answerId: answer4.id,
              competenceId: 'competenceRecordIdTwo',
              skillId: skillWeb1.id,
              earnedPix: 4
            });

            sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
              .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdTwo: [ke, ke2, ke3, ke4] });

            // when
            const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'date' });

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
            challengeRepository.list.resolves([
              challengeForSkillRecherche4,
              challengeForSkillCitation4AndMoteur3,
              challengeForSkillCollaborer4,
              challengeForSkillSearch1,
              challenge2ForSkillSearch1,
            ]);

            const answer1 = new Answer({ id: 123, challengeId: challengeForSkillRecherche4.id, result: 'ok' });
            const answer2 = new Answer({ id: 456, challengeId: challengeForSkillCitation4AndMoteur3.id, result: 'ok' });
            const answer4 = new Answer({ id: 789, challengeId: challengeForSkillSearch1.id, result: 'ok' });

            answerRepository.findChallengeIdsFromAnswerIds
              .withArgs([answer1.id, answer2.id, answer2.id, answer4.id])
              .resolves([
                challengeForSkillRecherche4.id,
                challengeForSkillCitation4AndMoteur3.id,
                challengeForSkillSearch1.id
              ]);

            const ke = domainBuilder.buildKnowledgeElement({
              answerId: answer1.id,
              skillId: skillRecherche4.id,
              earnedPix: 4
            });

            const ke2 = domainBuilder.buildKnowledgeElement({
              answerId: answer2.id,
              skillId: skillCitation4.id,
              earnedPix: 4
            });

            const ke3 = domainBuilder.buildKnowledgeElement({
              answerId: answer2.id,
              skillId: skillMoteur3.id,
              earnedPix: 4
            });

            const ke4 = domainBuilder.buildKnowledgeElement({
              answerId: answer4.id,
              skillId: skillSearch1.id,
              earnedPix: 4
            });

            sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
              .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdOne: [ke, ke2, ke3, ke4] });

            // when
            const actualCertificationProfile = await userService.getCertificationProfile({ userId, limitDate: 'date' });

            // then
            expect(actualCertificationProfile.userCompetences[0].skills)
              .to.have.members([skillCitation4, skillRecherche4, skillMoteur3, skillSearch1]);
            expect(actualCertificationProfile.userCompetences[0].challenges)
              .to.have.members([challengeForSkillCitation4AndMoteur3, challengeForSkillRecherche4, challenge2ForSkillSearch1]);
          });
        });
      });
    });
  });
});
