const { describe, it, expect, beforeEach, afterEach, sinon } = require('../../../test-helper');
const Bookshelf = require('../../../../lib/infrastructure/bookshelf');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const userService = require('../../../../lib/domain/services/user-service');
const { UserNotFoundError } = require('../../../../lib/domain/errors');

const Answer = require('../../../../lib/infrastructure/data/answer');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Skill = require('../../../../lib/domain/models/Skill');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Competence = require('../../../../lib/domain/models/referential/competence');

describe('Unit | Service | User Service', () => {

  describe('#isUserExistingByEmail', () => {

    const email = 'shi@fu.me';

    beforeEach(() => {
      sinon.stub(userRepository, 'findByEmail');
    });

    afterEach(() => {
      userRepository.findByEmail.restore();
    });

    it('should call a userRepository#findByEmail', () => {
      // given
      userRepository.findByEmail.resolves();

      // when
      const promise = userService.isUserExistingByEmail(email);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(userRepository.findByEmail);
        sinon.assert.calledWith(userRepository.findByEmail, email);
      });
    });

    it('should return true, when user is found', () => {
      // given
      const foundUser = {};
      userRepository.findByEmail.resolves(foundUser);

      // when
      const promise = userService.isUserExistingByEmail(email);

      // then
      return promise.then((result) => {
        expect(result).to.equal(true);
      });
    });

    it('should throw an error, when no user found', () => {
      // given
      userRepository.findByEmail.rejects();

      // when
      const promise = userService.isUserExistingByEmail(email);

      // then
      return promise.catch((result) => {
        expect(result).to.be.an.instanceOf(UserNotFoundError);
      });
    });
  });

  describe('#isUserExistingById', () => {

    const userId = 4367;

    beforeEach(() => {
      sinon.stub(userRepository, 'findUserById');
    });

    afterEach(() => {
      userRepository.findUserById.restore();
    });

    it('should call a userRepository.findUserById', () => {
      // given
      userRepository.findUserById.resolves();

      // when
      const promise = userService.isUserExistingById(userId);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(userRepository.findUserById);
        sinon.assert.calledWith(userRepository.findUserById, userId);
      });
    });

    it('should return true, when user is found', () => {
      // given
      const foundUser = {};
      userRepository.findUserById.resolves(foundUser);

      // when
      const promise = userService.isUserExistingById(userId);

      // then
      return promise.then((result) => {
        expect(result).to.equal(true);
      });
    });

    it('should throw an error, when no user found', () => {
      // given
      userRepository.findUserById.rejects();

      // when
      const promise = userService.isUserExistingById(userId);

      // then
      return promise.catch((result) => {
        expect(result).to.be.an.instanceOf(UserNotFoundError);
      });
    });
  });

  describe('#getProfileToCertify', () => {

    let sandbox;
    const userId = 63731;

    const AnswerCollection = Bookshelf.Collection.extend({
      model: Answer
    });
    const answerCollectionWithEmptyData = AnswerCollection.forge([]);

    function _createCompetence(id, index, name) {
      const competence = new Competence();
      competence.id = id;
      competence.index = index;
      competence.name = name;

      return competence;
    }

    function _createChallenge(id, competence, skills, testedSkill, status = 'validé') {
      const challenge = new Challenge();
      challenge.id = id;
      challenge.skills = skills;
      challenge.competence = competence;
      challenge.testedSkill = testedSkill;
      challenge.status = status;
      return challenge;
    }

    const skillCitation4 = new Skill({ name: '@citation4' });
    const skillCollaborer4 = new Skill({ name: '@collaborer4' });
    const skillMoteur3 = new Skill({ name: '@moteur3' });
    const skillRecherche4 = new Skill({ name: '@recherche4' });
    const skillRemplir2 = new Skill({ name: '@remplir2' });
    const skillRemplir4 = new Skill({ name: '@remplir4' });
    const skillUrl3 = new Skill({ name: '@url3' });
    const skillWeb1 = new Skill({ name: '@web1' });
    const skillWithoutChallenge = new Skill({ name: '@oldSKill8' });

    const competenceFlipper = _createCompetence('competenceRecordIdOne', '1.1', '1.1 Construire un flipper');
    const competenceDauphin = _createCompetence('competenceRecordIdTwo', '1.2', '1.2 Adopter un dauphin');

    const challengeForSkillCitation4 = _createChallenge('challengeRecordIdOne', competenceFlipper.id, [skillCitation4], '@citation4');
    const challengeForSkillCitation4AndMoteur3 = _createChallenge('challengeRecordIdTwo', competenceFlipper.id, [skillCitation4, skillMoteur3], '@citation4');
    const challengeForSkillCollaborer4 = _createChallenge('challengeRecordIdThree', 'competenceRecordIdThatDoesNotExistAnymore', [skillCollaborer4], '@collaborer4');
    const challengeForSkillRecherche4 = _createChallenge('challengeRecordIdFour', competenceFlipper.id, [skillRecherche4], '@recherche4');
    const challengeForSkillRemplir2 = _createChallenge('challengeRecordIdFive', competenceDauphin.id, [skillRemplir2], '@remplir2');
    const challengeForSkillRemplir4 = _createChallenge('challengeRecordIdSix', competenceDauphin.id, [skillRemplir4], '@remplir4');
    const challengeForSkillUrl3 = _createChallenge('challengeRecordIdSeven', competenceDauphin.id, [skillUrl3], '@url3');
    const challengeForSkillWeb1 = _createChallenge('challengeRecordIdEight', competenceDauphin.id, [skillWeb1], '@web1');
    const challengeRecordWithoutSkills = _createChallenge('challengeRecordIdNine', competenceFlipper.id, [], null);
    const archivedChallengeForSkillCitation4 = _createChallenge('challengeRecordIdTen', competenceFlipper.id, [skillCitation4], '@citation4', 'archive');
    const oldChallengeWithAlreadyValidatedSkill = _createChallenge('challengeRecordIdEleven', competenceFlipper.id, [skillWithoutChallenge], '@oldSkill8', 'proposé');

    const assessment1 = new Assessment({ id: 13, estimatedLevel: 1, pixScore: 12, courseId: 'courseId1' });
    const assessment2 = new Assessment({ id: 1637, estimatedLevel: 2, pixScore: 23, courseId: 'courseId2' });
    const assessment3 = new Assessment({ id: 145, estimatedLevel: 0, pixScore: 2, courseId: 'courseId3' });

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      sandbox.stub(courseRepository, 'getAdaptiveCourses').resolves([
        { competences: ['competenceRecordIdOne'], id: 'courseId1' },
        { competences: ['competenceRecordIdTwo'], id: 'courseId2' },
      ]);
      sandbox.stub(assessmentRepository, 'findLastCompletedAssessmentsForEachCoursesByUser').resolves([
        assessment1, assessment2, assessment3
      ]);

      sandbox.stub(challengeRepository, 'list').resolves([
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
      sandbox.stub(answerRepository, 'findCorrectAnswersByAssessment').resolves(answerCollectionWithEmptyData);
      sandbox.stub(competenceRepository, 'list').resolves([
        competenceFlipper,
        competenceDauphin
      ]);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should load achieved assessments', () => {
      // When
      const promise = userService.getProfileToCertify(userId, '2020-10-27 08:44:25');

      // Then
      return promise.then(() => {
        sinon.assert.calledOnce(assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser);
        sinon.assert.calledWith(assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser, userId, '2020-10-27 08:44:25');
      });
    });

    it('should list available challenges', () => {
      // When
      const promise = userService.getProfileToCertify(userId);

      // Then
      return promise.then(() => {
        sinon.assert.calledOnce(challengeRepository.list);
      });
    });

    it('should list right answers for every assessment fulfilled', () => {
      // When
      const promise = userService.getProfileToCertify(userId);

      // Then
      return promise.then(() => {
        sinon.assert.calledTwice(answerRepository.findCorrectAnswersByAssessment);
      });
    });

    it('should not list right answers for assessments that have an estimated level null or 1', () => {
      // When
      const promise = userService.getProfileToCertify(userId);

      // Then
      return promise.then(() => {
        sinon.assert.neverCalledWith(answerRepository.findCorrectAnswersByAssessment, assessment3.id);
      });
    });

    it('should list available competences', () => {
      // When
      const promise = userService.getProfileToCertify(userId);

      // Then
      return promise.then(() => {
        sinon.assert.calledOnce(competenceRepository.list);
      });
    });

    context('when all informations needed are collected', () => {
      it('should assign skill to related competence', () => {
        // Given
        const answerInstance = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answerCollectionWithOneAnswer = AnswerCollection.forge([answerInstance]);

        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionWithOneAnswer);

        // When
        const promise = userService.getProfileToCertify(userId);

        // Then
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

          it('should not return the skill', function() {
            // Given
            const answerOfOldChallenge = new Answer({
              challengeId: oldChallengeWithAlreadyValidatedSkill.id,
              result: 'ok'
            });
            const answerCollectionWithOneAnswer = AnswerCollection.forge([answerOfOldChallenge]);

            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithOneAnswer);
            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionWithEmptyData);

            // When
            const promise = userService.getProfileToCertify(userId);

            // Then
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
            // Given
            const answer = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
            const answerCollectionWithOneAnswer = AnswerCollection.forge([answer]);

            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionWithOneAnswer);

            // When
            const promise = userService.getProfileToCertify(userId);

            // Then
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
            // Given
            const answer = new Answer({ challengeId: challengeForSkillCitation4.id, result: 'ok' });
            const answerCollectionWithOneAnswer = AnswerCollection.forge([answer]);

            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithOneAnswer);
            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionWithEmptyData);

            // When
            const promise = userService.getProfileToCertify(userId);

            // Then
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
            // Given
            const answer = new Answer({ challengeId: challengeForSkillRecherche4.id, result: 'ok' });
            const answer2 = new Answer({ challengeId: challengeForSkillCitation4AndMoteur3.id, result: 'ok' });
            const answerCollectionWithTwoAnswers = AnswerCollection.forge([answer, answer2]);

            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithTwoAnswers);
            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionWithEmptyData);

            // When
            const promise = userService.getProfileToCertify(userId);

            // Then
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
        // Given
        const answerA1 = new Answer({ challengeId: challengeForSkillRecherche4.id, result: 'ok' });
        const answerCollectionA = AnswerCollection.forge([answerA1]);

        const answerB1 = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answerB2 = new Answer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
        const answerCollectionB = AnswerCollection.forge([answerB1, answerB2]);

        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionA);
        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionB);

        // When
        const promise = userService.getProfileToCertify(userId);

        // Then
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
        // Given
        const answer1 = new Answer({ challengeId: challengeForSkillRemplir4.id, result: 'ok' });
        const answer2 = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answer3 = new Answer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
        const answerCollectionArray = AnswerCollection.forge([answer1, answer2, answer3]);

        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionArray);

        // When
        const promise = userService.getProfileToCertify(userId);

        // Then
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
        // Given
        const answer1 = new Answer({ challengeId: challengeForSkillRemplir4.id, result: 'ok' });
        const answer2 = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answer3 = new Answer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
        const answer4 = new Answer({ challengeId: challengeForSkillWeb1.id, result: 'ok' });
        const answerCollectionArray = AnswerCollection.forge([answer1, answer2, answer3, answer4]);

        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionArray);

        // When
        const promise = userService.getProfileToCertify(userId);

        // Then
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
        // Given
        const answer = new Answer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answerCollectionArray = AnswerCollection.forge([answer, answer]);

        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionArray);

        // When
        const promise = userService.getProfileToCertify(userId);

        // Then
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
        // Given
        const answer = new Answer({ challengeId: 'challengeRecordIdThatDoesNotExist', result: 'ok' });
        const answerCollectionArray = AnswerCollection.forge(answer);

        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionArray);

        // When
        const promise = userService.getProfileToCertify(userId);

        // Then
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
        // Given
        const answer = new Answer({ challengeId: 'challengeRecordIdThree', result: 'ok' });
        const answerCollectionArray = AnswerCollection.forge(answer);

        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionArray);

        // When
        const promise = userService.getProfileToCertify(userId);

        // Then
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
  });
});
