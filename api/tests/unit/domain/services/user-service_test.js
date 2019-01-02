const { expect, sinon } = require('../../../test-helper');
const Bookshelf = require('../../../../lib/infrastructure/bookshelf');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const userService = require('../../../../lib/domain/services/user-service');
const { UserNotFoundError } = require('../../../../lib/domain/errors');

const BookshelfAnswer = require('../../../../lib/infrastructure/data/answer');
const User = require('../../../../lib/domain/models/User');
const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Skill = require('../../../../lib/domain/models/Skill');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Competence = require('../../../../lib/domain/models/Competence');

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
      const foundUser = new User({});
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
      model: BookshelfAnswer
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
      const challenge = Challenge.fromAttributes();
      challenge.id = id;
      challenge.skills = skills;
      challenge.competenceId = competence;
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
    const skillUrl1 = new Skill({ name: '@url1' });
    const skillWithoutChallenge = new Skill({ name: '@oldSKill8' });

    const competenceFlipper = _createCompetence('competenceRecordIdOne', '1.1', '1.1 Construire un flipper');
    const competenceDauphin = _createCompetence('competenceRecordIdTwo', '1.2', '1.2 Adopter un dauphin');

    const challengeForSkillCollaborer4 = _createChallenge('challengeRecordIdThree', 'competenceRecordIdThatDoesNotExistAnymore', [skillCollaborer4], '@collaborer4');

    const challengeForSkillCitation4 = _createChallenge('challengeRecordIdOne', competenceFlipper.id, [skillCitation4], '@citation4');
    const challengeForSkillCitation4AndMoteur3 = _createChallenge('challengeRecordIdTwo', competenceFlipper.id, [skillCitation4, skillMoteur3], '@citation4');
    const challengeForSkillRecherche4 = _createChallenge('challengeRecordIdFour', competenceFlipper.id, [skillRecherche4], '@recherche4');
    const challengeRecordWithoutSkills = _createChallenge('challengeRecordIdNine', competenceFlipper.id, [], null);
    const archivedChallengeForSkillCitation4 = _createChallenge('challengeRecordIdTen', competenceFlipper.id, [skillCitation4], '@citation4', 'archive');
    const oldChallengeWithAlreadyValidatedSkill = _createChallenge('challengeRecordIdEleven', competenceFlipper.id, [skillWithoutChallenge], '@oldSkill8', 'proposé');
    const challengeForSkillUrl1 = _createChallenge('challenge_url1', competenceFlipper.id, [skillUrl1], '@url1');
    const challenge2ForSkillUrl1 = _createChallenge('challenge_bis_url1', competenceFlipper.id, [skillUrl1], '@url1');

    const challengeForSkillRemplir2 = _createChallenge('challengeRecordIdFive', competenceDauphin.id, [skillRemplir2], '@remplir2');
    const challengeForSkillRemplir4 = _createChallenge('challengeRecordIdSix', competenceDauphin.id, [skillRemplir4], '@remplir4');
    const challengeForSkillUrl3 = _createChallenge('challengeRecordIdSeven', competenceDauphin.id, [skillUrl3], '@url3');
    const challengeForSkillWeb1 = _createChallenge('challengeRecordIdEight', competenceDauphin.id, [skillWeb1], '@web1');

    const assessmentResult1 = new AssessmentResult({ level: 1, pixScore: 12 });
    const assessmentResult2 = new AssessmentResult({ level: 2, pixScore: 23 });
    const assessmentResult3 = new AssessmentResult({ level: 0, pixScore: 2 });
    const assessment1 = Assessment.fromAttributes({ id: 13, status: 'completed', courseId: 'courseId1', assessmentResults: [assessmentResult1] });
    const assessment2 = Assessment.fromAttributes({ id: 1637, status: 'completed', courseId: 'courseId2', assessmentResults: [assessmentResult2] });
    const assessment3 = Assessment.fromAttributes({ id: 145, status: 'completed', courseId: 'courseId3', assessmentResults: [assessmentResult3] });

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
      // when
      const promise = userService.getProfileToCertify(userId, '2020-10-27 08:44:25');

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser);
        sinon.assert.calledWith(assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser, userId, '2020-10-27 08:44:25');
      });
    });

    it('should list available challenges', () => {
      // when
      const promise = userService.getProfileToCertify(userId);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(challengeRepository.list);
      });
    });

    it('should list right answers for every assessment fulfilled', () => {
      // when
      const promise = userService.getProfileToCertify(userId);

      // then
      return promise.then(() => {
        sinon.assert.calledTwice(answerRepository.findCorrectAnswersByAssessment);
      });
    });

    it('should not list right answers for assessments that have an estimated level null or 1', () => {
      // when
      const promise = userService.getProfileToCertify(userId);

      // then
      return promise.then(() => {
        sinon.assert.neverCalledWith(answerRepository.findCorrectAnswersByAssessment, assessment3.id);
      });
    });

    it('should list available competences', () => {
      // when
      const promise = userService.getProfileToCertify(userId);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(competenceRepository.list);
      });
    });

    context('when all informations needed are collected', () => {

      it('should assign skill to related competence', () => {
        // given
        const answerInstance = new BookshelfAnswer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answerCollectionWithOneAnswer = AnswerCollection.forge([answerInstance]);

        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionWithOneAnswer);

        // when
        const promise = userService.getProfileToCertify(userId);

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
            const answerOfOldChallenge = new BookshelfAnswer({
              challengeId: oldChallengeWithAlreadyValidatedSkill.id,
              result: 'ok'
            });
            const answerCollectionWithOneAnswer = AnswerCollection.forge([answerOfOldChallenge]);

            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithOneAnswer);
            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionWithEmptyData);

            // when
            const promise = userService.getProfileToCertify(userId);

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
            const answer = new BookshelfAnswer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
            const answerCollectionWithOneAnswer = AnswerCollection.forge([answer]);

            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionWithOneAnswer);

            // when
            const promise = userService.getProfileToCertify(userId);

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
            const answer = new BookshelfAnswer({ challengeId: challengeForSkillCitation4.id, result: 'ok' });
            const answerCollectionWithOneAnswer = AnswerCollection.forge([answer]);

            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithOneAnswer);
            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionWithEmptyData);

            // when
            const promise = userService.getProfileToCertify(userId);

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
            const answer = new BookshelfAnswer({ challengeId: challengeForSkillRecherche4.id, result: 'ok' });
            const answer2 = new BookshelfAnswer({ challengeId: challengeForSkillCitation4AndMoteur3.id, result: 'ok' });
            const answerCollectionWithTwoAnswers = AnswerCollection.forge([answer, answer2]);

            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithTwoAnswers);
            answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionWithEmptyData);

            // when
            const promise = userService.getProfileToCertify(userId);

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
        const answerA1 = new BookshelfAnswer({ challengeId: challengeForSkillRecherche4.id, result: 'ok' });
        const answerCollectionA = AnswerCollection.forge([answerA1]);

        const answerB1 = new BookshelfAnswer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answerB2 = new BookshelfAnswer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
        const answerCollectionB = AnswerCollection.forge([answerB1, answerB2]);

        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionA);
        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionB);

        // when
        const promise = userService.getProfileToCertify(userId);

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
        const answer1 = new BookshelfAnswer({ challengeId: challengeForSkillRemplir4.id, result: 'ok' });
        const answer2 = new BookshelfAnswer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answer3 = new BookshelfAnswer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
        const answerCollectionArray = AnswerCollection.forge([answer1, answer2, answer3]);

        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionArray);

        // when
        const promise = userService.getProfileToCertify(userId);

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
        const answer1 = new BookshelfAnswer({ challengeId: challengeForSkillRemplir4.id, result: 'ok' });
        const answer2 = new BookshelfAnswer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answer3 = new BookshelfAnswer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
        const answer4 = new BookshelfAnswer({ challengeId: challengeForSkillWeb1.id, result: 'ok' });
        const answerCollectionArray = AnswerCollection.forge([answer1, answer2, answer3, answer4]);

        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionArray);

        // when
        const promise = userService.getProfileToCertify(userId);

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
        const answer = new BookshelfAnswer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
        const answerCollectionArray = AnswerCollection.forge([answer, answer]);

        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionArray);

        // when
        const promise = userService.getProfileToCertify(userId);

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
        const answer = new BookshelfAnswer({ challengeId: 'challengeRecordIdThatDoesNotExist', result: 'ok' });
        const answerCollectionArray = AnswerCollection.forge(answer);

        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionArray);

        // when
        const promise = userService.getProfileToCertify(userId);

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
        const answer = new BookshelfAnswer({ challengeId: 'challengeRecordIdThree', result: 'ok' });
        const answerCollectionArray = AnswerCollection.forge(answer);

        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
        answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionArray);

        // when
        const promise = userService.getProfileToCertify(userId);

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
      context('when competence has simple challenge', () => {

        it('should return three challenge by competence', () => {
          // given
          const answer1 = new BookshelfAnswer({ challengeId: challengeForSkillRemplir4.id, result: 'ok' });
          const answer2 = new BookshelfAnswer({ challengeId: challengeForSkillRemplir2.id, result: 'ok' });
          const answer3 = new BookshelfAnswer({ challengeId: challengeForSkillUrl3.id, result: 'ok' });
          const answer4 = new BookshelfAnswer({ challengeId: challengeForSkillWeb1.id, result: 'ok' });
          const answerCollectionArray = AnswerCollection.forge([answer1, answer2, answer3, answer4]);

          answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
          answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionArray);

          // when
          const promise = userService.getProfileToCertify(userId);

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
      });

      context('when competence has challenge than validated two skills', () => {
        it('should return three challenge by competence', () => {
          // given
          const answer1 = new BookshelfAnswer({ challengeId: challengeForSkillRecherche4.id, result: 'ok' });
          const answer2 = new BookshelfAnswer({ challengeId: challengeForSkillCitation4AndMoteur3.id, result: 'ok' });
          const answer4 = new BookshelfAnswer({ challengeId: challengeForSkillUrl1.id, result: 'ok' });
          const answerCollectionArray = AnswerCollection.forge([answer1, answer2, answer4]);

          answerRepository.findCorrectAnswersByAssessment.withArgs(assessment1.id).resolves(answerCollectionWithEmptyData);
          answerRepository.findCorrectAnswersByAssessment.withArgs(assessment2.id).resolves(answerCollectionArray);
          challengeRepository.list.resolves([
            challengeForSkillRecherche4,
            challengeForSkillCitation4AndMoteur3,
            challengeForSkillCollaborer4,
            challengeForSkillUrl1,
            challenge2ForSkillUrl1,
          ]);

          // when
          const promise = userService.getProfileToCertify(userId);

          // then
          return promise.then((skillProfile) => {
            expect(skillProfile[0].skills).to.have.members([skillCitation4, skillRecherche4, skillMoteur3, skillUrl1]);
            expect(skillProfile[0].challenges).to.have.members([challengeForSkillCitation4AndMoteur3,challengeForSkillRecherche4, challenge2ForSkillUrl1]);
          });
        });
      });
    });
  });

});
