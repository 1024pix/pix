const { expect, sinon } = require('../../../test-helper');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const userService = require('../../../../lib/domain/services/user-service');

const Answer = require('../../../../lib/domain/models/Answer');
const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Skill = require('../../../../lib/domain/models/Skill');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Competence = require('../../../../lib/domain/models/Competence');

describe('Integration | Service | User Service | #getProfileToCertify', function() {

  const userId = 63731;

  const answerCollectionWithEmptyData = [];

  function _createCompetence(id, index, name) {
    const competence = new Competence();
    competence.id = id;
    competence.index = index;
    competence.name = name;

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

  const competenceFlipper = _createCompetence('competenceRecordIdOne', '1.1', '1.1 Construire un flipper');
  const competenceDauphin = _createCompetence('competenceRecordIdTwo', '1.2', '1.2 Adopter un dauphin');

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

  describe('#getProfileToCertifyV1', () => {

    const assessmentResult1 = new AssessmentResult({ level: 1, pixScore: 12 });
    const assessmentResult2 = new AssessmentResult({ level: 2, pixScore: 23 });
    const assessmentResult3 = new AssessmentResult({ level: 0, pixScore: 2 });
    const assessment1 = Assessment.fromAttributes({ id: 13, status: 'completed', courseId: 'courseId1', assessmentResults: [assessmentResult1] });
    const assessment2 = Assessment.fromAttributes({ id: 1637, status: 'completed', courseId: 'courseId2', assessmentResults: [assessmentResult2] });
    const assessment3 = Assessment.fromAttributes({ id: 145, status: 'completed', courseId: 'courseId3', assessmentResults: [assessmentResult3] });

    beforeEach(() => {
      sinon.stub(assessmentRepository, 'findLastCompletedAssessmentsForEachCoursesByUser').resolves([
        assessment1, assessment2, assessment3
      ]);
      sinon.stub(answerRepository, 'findCorrectAnswersByAssessmentId').resolves(answerCollectionWithEmptyData);
    });

    it('should load achieved assessments', () => {
      // when
      const promise = userService.getProfileToCertifyV1(userId, '2020-10-27 08:44:25');

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser);
        sinon.assert.calledWith(assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser, userId, '2020-10-27 08:44:25');
      });
    });

    it('should list available challenges', () => {
      // when
      const promise = userService.getProfileToCertifyV1(userId);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(challengeRepository.list);
      });
    });

    it('should list right answers for every assessment fulfilled', () => {
      // when
      const promise = userService.getProfileToCertifyV1(userId);

      // then
      return promise.then(() => {
        sinon.assert.calledTwice(answerRepository.findCorrectAnswersByAssessmentId);
      });
    });

    it('should not list right answers for assessments that have an estimated level null or 0', () => {
      // when
      const promise = userService.getProfileToCertifyV1(userId);

      // then
      return promise.then(() => {
        sinon.assert.neverCalledWith(answerRepository.findCorrectAnswersByAssessmentId, assessment3.id);
      });
    });

    it('should list available competences', () => {
      // when
      const promise = userService.getProfileToCertifyV1(userId);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(competenceRepository.list);
      });
    });

    context('when all informations needed are collected', () => {

      it('should assign skill to related competence', () => {
        // given
        const answer = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answerCollectionWithOneAnswer = [answer];

        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionWithOneAnswer);

        // when
        const promise = userService.getProfileToCertifyV1(userId);

        // then
        return promise.then((skillProfile) => {
          expect(skillProfile).to.deep.equal([
            {
              id: 'competenceRecordIdOne',
              index: '1.1',
              name: '1.1 Construire un flipper',
              skills: [],
              pixScore: 12,
              estimatedLevel: 1,
              challenges: []
            },
            {
              id: 'competenceRecordIdTwo',
              index: '1.2',
              name: '1.2 Adopter un dauphin',
              skills: [skillRemplir2],
              pixScore: 23,
              estimatedLevel: 2,
              challenges: [challengeForSkillRemplir2]
            }]);
        });
      });

      context('when selecting challenges to validate the skills per competence', () => {

        context('when no challenge validate the skill', () => {

          it('should not return the skill', () => {
            // given
            const answerOfOldChallenge = new Answer({
              challengeId: oldChallengeWithAlreadyValidatedSkill.id,
              result: 'ok'
            });
            const answerCollectionWithOneAnswer = [answerOfOldChallenge];

            answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithOneAnswer);
            answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionWithEmptyData);

            // when
            const promise = userService.getProfileToCertifyV1(userId);

            // then
            return promise.then((skillProfile) => {
              expect(skillProfile).to.deep.equal([{
                id: 'competenceRecordIdOne',
                index: '1.1',
                name: '1.1 Construire un flipper',
                pixScore: 12,
                estimatedLevel: 1,
                skills: [],
                challenges: []
              }, {
                id: 'competenceRecordIdTwo',
                index: '1.2',
                name: '1.2 Adopter un dauphin',
                pixScore: 23,
                estimatedLevel: 2,
                skills: [],
                challenges: []
              }]);
            });
          });
        });

        context('when only one challenge validate the skill', () => {

          it('should select the same challenge', () => {
            // given
            const answer = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
            const answerCollectionWithOneAnswer = [answer];

            answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
            answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionWithOneAnswer);

            // when
            const promise = userService.getProfileToCertifyV1(userId);

            // then
            return promise.then((skillProfile) => {
              expect(skillProfile).to.deep.equal([
                {
                  id: 'competenceRecordIdOne',
                  index: '1.1',
                  name: '1.1 Construire un flipper',
                  skills: [],
                  pixScore: 12,
                  estimatedLevel: 1,
                  challenges: []
                },
                {
                  id: 'competenceRecordIdTwo',
                  index: '1.2',
                  name: '1.2 Adopter un dauphin',
                  skills: [skillRemplir2],
                  pixScore: 23,
                  estimatedLevel: 2,
                  challenges: [challengeForSkillRemplir2]
                }]);
            });
          });
        });

        context('when three challenges validate the same skill', () => {

          it('should select the unanswered challenge which is published', () => {
            // given
            const answer = new Answer({ challengeId: challengeForSkillCitation4.id, result: 'ok' });
            const answerCollectionWithOneAnswer = [answer];

            answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithOneAnswer);
            answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionWithEmptyData);

            // when
            const promise = userService.getProfileToCertifyV1(userId);

            // then
            return promise.then((skillProfile) => {
              expect(skillProfile).to.deep.equal([
                {
                  id: 'competenceRecordIdOne',
                  index: '1.1',
                  name: '1.1 Construire un flipper',
                  skills: [skillCitation4],
                  pixScore: 12,
                  estimatedLevel: 1,
                  challenges: [challengeForSkillCitation4AndMoteur3]
                },
                {
                  id: 'competenceRecordIdTwo',
                  index: '1.2',
                  name: '1.2 Adopter un dauphin',
                  skills: [],
                  pixScore: 23,
                  estimatedLevel: 2,
                  challenges: []
                }]);
            });
          });

          it('should select a challenge for every skill', () => {
            // given
            const answer = new Answer({ challengeId: challengeForSkillRecherche4.id, result: 'ok' });
            const answer2 = new Answer({ challengeId: challengeForSkillCitation4AndMoteur3.id, result: 'ok' });
            const answerCollectionWithTwoAnswers = [answer, answer2];

            answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithTwoAnswers);
            answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionWithEmptyData);

            // when
            const promise = userService.getProfileToCertifyV1(userId);

            // then
            return promise.then((skillProfile) => {
              expect(skillProfile).to.deep.equal([
                {
                  id: 'competenceRecordIdOne',
                  index: '1.1',
                  name: '1.1 Construire un flipper',
                  skills: [skillCitation4, skillRecherche4, skillMoteur3],
                  pixScore: 12,
                  estimatedLevel: 1,
                  challenges: [challengeForSkillCitation4, challengeForSkillRecherche4, challengeForSkillCitation4AndMoteur3]
                },
                {
                  id: 'competenceRecordIdTwo',
                  index: '1.2',
                  name: '1.2 Adopter un dauphin',
                  skills: [],
                  pixScore: 23,
                  estimatedLevel: 2,
                  challenges: []
                }]);
            });
          });
        });
      });

      it('should group skills by competence ', () => {
        // given
        const answerA1 = new Answer({ challengeId: challengeForSkillRecherche4.id, result: 'ok' });
        const answerCollectionA = [answerA1];

        const answerB1 = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answerB2 = new Answer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
        const answerCollectionB = [answerB1, answerB2];

        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionA);
        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionB);

        // when
        const promise = userService.getProfileToCertifyV1(userId);

        // then
        return promise.then((skillProfile) => {
          expect(skillProfile).to.deep.equal([
            {
              id: 'competenceRecordIdOne',
              index: '1.1',
              name: '1.1 Construire un flipper',
              skills: [skillRecherche4],
              pixScore: 12,
              estimatedLevel: 1,
              challenges: [challengeForSkillRecherche4]
            },
            {
              id: 'competenceRecordIdTwo',
              index: '1.2',
              name: '1.2 Adopter un dauphin',
              skills: [skillUrl3, skillRemplir2],
              pixScore: 23,
              estimatedLevel: 2,
              challenges: [challengeForSkillUrl3, challengeForSkillRemplir2]
            }]);
        });
      });

      it('should sort in desc grouped skills by competence', () => {
        // given
        const answer1 = new Answer({ challengeId: challengeForSkillRemplir4.id, result: 'ok' });
        const answer2 = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answer3 = new Answer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
        const answerCollectionArray = [answer1, answer2, answer3];

        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionArray);

        // when
        const promise = userService.getProfileToCertifyV1(userId);

        // then
        return promise.then((skillProfile) => {
          expect(skillProfile).to.deep.equal([
            {
              id: 'competenceRecordIdOne',
              index: '1.1',
              name: '1.1 Construire un flipper',
              skills: [],
              pixScore: 12,
              estimatedLevel: 1,
              challenges: []
            },
            {
              id: 'competenceRecordIdTwo',
              index: '1.2',
              name: '1.2 Adopter un dauphin',
              skills: [skillRemplir4, skillUrl3, skillRemplir2],
              pixScore: 23,
              estimatedLevel: 2,
              challenges: [challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2]
            }
          ]);
        });
      });

      it('should return the three most difficult skills sorted in desc grouped by competence', () => {
        // given
        const answer1 = new Answer({ challengeId: challengeForSkillRemplir4.id, result: 'ok' });
        const answer2 = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answer3 = new Answer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
        const answer4 = new Answer({ challengeId: challengeForSkillWeb1.id, result: 'ok' });
        const answerCollectionArray = [answer1, answer2, answer3, answer4];

        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionArray);

        // when
        const promise = userService.getProfileToCertifyV1(userId);

        // then
        return promise.then((skillProfile) => {
          expect(skillProfile).to.deep.equal([
            {
              id: 'competenceRecordIdOne',
              index: '1.1',
              name: '1.1 Construire un flipper',
              skills: [],
              pixScore: 12,
              estimatedLevel: 1,
              challenges: []
            },
            {
              id: 'competenceRecordIdTwo',
              index: '1.2',
              name: '1.2 Adopter un dauphin',
              skills: [skillRemplir4, skillUrl3, skillRemplir2],
              pixScore: 23,
              estimatedLevel: 2,
              challenges: [challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2]
            }
          ]);
        });
      });

      it('should not add a skill twice', () => {
        // given
        const answer = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answerCollectionArray = [answer, answer];

        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionArray);

        // when
        const promise = userService.getProfileToCertifyV1(userId);

        // then
        return promise.then((skillProfile) => {
          expect(skillProfile).to.deep.equal([
            {
              id: 'competenceRecordIdOne',
              index: '1.1',
              name: '1.1 Construire un flipper',
              skills: [],
              pixScore: 12,
              estimatedLevel: 1,
              challenges: []
            },
            {
              id: 'competenceRecordIdTwo',
              index: '1.2',
              name: '1.2 Adopter un dauphin',
              skills: [skillRemplir2],
              pixScore: 23,
              estimatedLevel: 2,
              challenges: [challengeForSkillRemplir2]
            }]);
        });
      });

      it('should not assign skill, when the challenge id is not found', () => {
        // given
        const answer = new Answer({ challengeId: 'challengeRecordIdThatDoesNotExist', result: 'ok' });
        const answerCollectionArray = [answer];

        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionArray);

        // when
        const promise = userService.getProfileToCertifyV1(userId);

        // then
        return promise.then((skillProfile) => {
          expect(skillProfile).to.deep.equal([
            {
              id: 'competenceRecordIdOne',
              index: '1.1',
              name: '1.1 Construire un flipper',
              skills: [],
              pixScore: 12,
              estimatedLevel: 1,
              challenges: []
            },
            {
              id: 'competenceRecordIdTwo',
              index: '1.2',
              name: '1.2 Adopter un dauphin',
              skills: [],
              pixScore: 23,
              estimatedLevel: 2,
              challenges: []
            }]);
        });
      });

      it('should not assign skill, when the competence is not found', () => {
        // given
        const answer = new Answer({ challengeId: 'challengeRecordIdThree', result: 'ok' });
        const answerCollectionArray = [answer];

        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionArray);

        // when
        const promise = userService.getProfileToCertifyV1(userId);

        // then
        return promise.then((skillProfile) => {
          expect(skillProfile).to.deep.equal([
            {
              id: 'competenceRecordIdOne',
              index: '1.1',
              name: '1.1 Construire un flipper',
              skills: [],
              pixScore: 12,
              estimatedLevel: 1,
              challenges: []
            },
            {
              id: 'competenceRecordIdTwo',
              index: '1.2',
              name: '1.2 Adopter un dauphin',
              skills: [],
              pixScore: 23,
              estimatedLevel: 2,
              challenges: []
            }]);
        });
      });
    });

    describe('should return always three challenge by competence', () => {
      context('when competence has not challenge which validated two skills', () => {

        it('should return three challenges by competence', () => {
          // given
          const answer1 = new Answer({ challengeId: challengeForSkillRemplir4.id, result: 'ok' });
          const answer2 = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
          const answer3 = new Answer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
          const answer4 = new Answer({ challengeId: challengeForSkillWeb1.id, result: 'ok' });
          const answerCollectionArray = [answer1, answer2, answer3, answer4];

          answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
          answerRepository.findCorrectAnswersByAssessmentId.withArgs(assessment2.id).resolves(answerCollectionArray);

          // when
          const promise = userService.getProfileToCertifyV1(userId);

          // then
          return promise.then((skillProfile) => {
            expect(skillProfile[1].skills).to.have.members([skillRemplir4, skillUrl3, skillRemplir2]);
            expect(skillProfile[1].challenges).to.have.members([challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2]);
          });
        });
      });

      context('when competence has challenge which validated two skills', () => {
        it('should return three challenges by competence', () => {
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
          const promise = userService.getProfileToCertifyV1(userId);

          // then
          return promise.then((skillProfile) => {
            expect(skillProfile[0].skills).to.have.members([skillCitation4, skillRecherche4, skillMoteur3, skillSearch1]);
            expect(skillProfile[0].challenges).to.have.members([challengeForSkillCitation4AndMoteur3,challengeForSkillRecherche4, challenge2ForSkillSearch1]);
          });
        });
      });
    });
  });

});
