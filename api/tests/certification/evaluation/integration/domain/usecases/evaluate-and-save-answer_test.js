import { CertificationDurationExceededError } from '../../../../../../src/certification/evaluation/domain/errors.js';
import { usecases } from '../../../../../../src/certification/evaluation/domain/usecases/index.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import {
  CertificationEndedByFinalizationError,
  CertificationEndedByInvigilatorError,
  ChallengeAlreadyAnsweredError,
  ChallengeNotAskedError,
  EmptyAnswerError,
  ForbiddenAccess,
  NotFoundError,
} from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

const { evaluateAndSaveAnswer } = usecases;

describe('Certification | Evaluation | Integration | Domain | UseCase | evaluate-and-save-answer', function () {
  const STATES = domainBuilder.certification.evaluation.buildAssessmentSheet.STATES;
  const STATES_OF_LAST_QUESTION = domainBuilder.certification.evaluation.buildAssessmentSheet.STATES_OF_LAST_QUESTION;
  const challengeIdToAnswer = 'expectedChallengeToBeAnswered';

  beforeEach(function () {
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'someSkillId',
    });
    databaseBuilder.factory.learningContent.buildChallenge({
      id: challengeIdToAnswer,
      solution: 'The answer is 42',
      skillId: 'someSkillId',
    });
    return databaseBuilder.commit();
  });

  context('when certification does not exist', function () {
    it('throws a NotFound error', async function () {
      const err = await catchErr(evaluateAndSaveAnswer)({
        certificationCourseId: 123,
        answer: domainBuilder.buildAnswer({ challengeId: challengeIdToAnswer }),
      });

      expect(err).to.deepEqualInstance(new NotFoundError('No certification test found with id 123'));
    });
  });

  context('when certification does exist', function () {
    let certificationCourseId, userId;

    context('when user submitting the answer is not the owner of the certification test', function () {
      it('throws a ForbiddenAccess error', async function () {
        userId = databaseBuilder.factory.buildUser().id;
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({ userId });
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          userId,
          candidateId: certificationCandidate.id,
        }).id;
        databaseBuilder.factory.buildAssessment({ certificationCourseId, userId });
        await databaseBuilder.commit();

        const err = await catchErr(evaluateAndSaveAnswer)({
          certificationCourseId,
          userId: userId + 1,
          answer: domainBuilder.buildAnswer({ challengeId: challengeIdToAnswer }),
        });

        expect(err).to.deepEqualInstance(
          new ForbiddenAccess('User is not allowed to add an answer for this certification test.'),
        );
      });
    });

    context('when user submitting the answer is the owner of the certification test', function () {
      beforeEach(function () {
        userId = databaseBuilder.factory.buildUser().id;
        return databaseBuilder.commit();
      });

      context('when certification test has been ended by the invigilator', function () {
        it('throws a CertificationEndedByInvigilatorError error', async function () {
          const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({ userId });
          certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            userId,
            candidateId: certificationCandidate.id,
          }).id;
          databaseBuilder.factory.buildAssessment({
            certificationCourseId,
            userId,
            state: STATES.ENDED_BY_INVIGILATOR,
          });
          await databaseBuilder.commit();

          const err = await catchErr(evaluateAndSaveAnswer)({
            certificationCourseId,
            userId,
            answer: domainBuilder.buildAnswer({ challengeId: challengeIdToAnswer }),
          });

          expect(err).to.deepEqualInstance(new CertificationEndedByInvigilatorError());
        });
      });

      context('when certification test has been ended by session finalization', function () {
        it('throws a CertificationEndedByFinalizationError error', async function () {
          const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({ userId });
          certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            userId,
            candidateId: certificationCandidate.id,
          }).id;
          databaseBuilder.factory.buildAssessment({
            certificationCourseId,
            userId,
            state: STATES.ENDED_DUE_TO_FINALIZATION,
          });
          await databaseBuilder.commit();

          const err = await catchErr(evaluateAndSaveAnswer)({
            certificationCourseId,
            userId,
            answer: domainBuilder.buildAnswer({ challengeId: challengeIdToAnswer }),
          });

          expect(err).to.deepEqualInstance(new CertificationEndedByFinalizationError());
        });
      });

      context('when certification test has been started for more than 24 hours', function () {
        it('ends the assessment due to duration exceeded and throws a CertificationDurationExceededError error', async function () {
          const sessionId = databaseBuilder.factory.buildSession().id;
          const candidateId = databaseBuilder.factory.buildCertificationCandidate({ userId, sessionId }).id;
          certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            userId,
            candidateId,
            sessionId,
            createdAt: new Date('2020-01-01'),
          }).id;
          const assessmentId = databaseBuilder.factory.buildAssessment({
            certificationCourseId,
            userId,
            state: STATES.STARTED,
            lastChallengeId: challengeIdToAnswer,
            lastQuestionState: STATES_OF_LAST_QUESTION.ASKED,
          }).id;
          await databaseBuilder.commit();

          const err = await catchErr(evaluateAndSaveAnswer)({
            certificationCourseId,
            userId,
            answer: domainBuilder.buildAnswer({ challengeId: challengeIdToAnswer }),
          });

          expect(err).to.deepEqualInstance(new CertificationDurationExceededError());
          const [state] = await knex('assessments').pluck('state').where({ id: assessmentId });
          expect(state).to.equal(STATES.ENDED_DUE_TO_DURATION_EXCEEDED);
        });
      });

      context('when certification test is still ongoing', function () {
        let assessmentId;

        beforeEach(function () {
          const sessionId = databaseBuilder.factory.buildSession().id;
          const candidateId = databaseBuilder.factory.buildCertificationCandidate({
            userId,
            sessionId,
          }).id;
          certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            userId,
            candidateId,
            sessionId,
            createdAt: new Date(),
          }).id;
          assessmentId = databaseBuilder.factory.buildAssessment({
            certificationCourseId,
            userId,
            state: STATES.STARTED,
            lastChallengeId: challengeIdToAnswer,
            lastQuestionState: STATES_OF_LAST_QUESTION.ASKED,
          }).id;
          return databaseBuilder.commit();
        });

        context('when answered challenge was not the one expected to be answered', function () {
          it('throws a ChallengeNotAskedError error', async function () {
            const err = await catchErr(evaluateAndSaveAnswer)({
              certificationCourseId,
              userId,
              answer: domainBuilder.buildAnswer({ challengeId: 'someOtherChallengeId' }),
            });

            expect(err).to.deepEqualInstance(new ChallengeNotAskedError());
          });
        });

        context('when answered challenge has already been answered', function () {
          it('throws a ChallengeAlreadyAnsweredError error', async function () {
            databaseBuilder.factory.buildAnswer({
              assessmentId,
              challengeId: challengeIdToAnswer,
            });
            await databaseBuilder.commit();

            const err = await catchErr(evaluateAndSaveAnswer)({
              certificationCourseId,
              userId,
              answer: domainBuilder.buildAnswer({ challengeId: challengeIdToAnswer }),
            });

            expect(err).to.deepEqualInstance(new ChallengeAlreadyAnsweredError());
          });
        });

        context('when answer has no value and is not a timeout', function () {
          it('throws a EmptyAnswerError error', async function () {
            const err = await catchErr(evaluateAndSaveAnswer)({
              certificationCourseId,
              userId,
              answer: domainBuilder.buildAnswer({ challengeId: challengeIdToAnswer, value: null, timeout: null }),
            });

            expect(err).to.deepEqualInstance(new EmptyAnswerError());
          });
        });

        context('when answer is admissible', function () {
          let currentAnswer;

          beforeEach(function () {
            currentAnswer = domainBuilder.buildAnswer({
              challengeId: challengeIdToAnswer,
              value: 'The answer is 42',
              assessmentId,
            });
            databaseBuilder.factory.buildAnswer({
              assessmentId,
              challengeId: 'someOtherChallengeId',
            });
            return databaseBuilder.commit();
          });

          context('when there is a live alert on the answered challenge', function () {
            it('throws a ForbiddenAccess error', async function () {
              databaseBuilder.factory.buildCertificationChallengeLiveAlert({
                status: CertificationChallengeLiveAlertStatus.VALIDATED,
                assessmentId,
                challengeId: challengeIdToAnswer,
              });
              await databaseBuilder.commit();

              const err = await catchErr(evaluateAndSaveAnswer)({
                certificationCourseId,
                userId,
                answer: domainBuilder.buildAnswer({ challengeId: challengeIdToAnswer }),
              });

              expect(err).to.deepEqualInstance(new ForbiddenAccess('An alert has been set.'));
            });
          });

          context('when there are no live alerts on the challenge', function () {
            it('saves the corrected answer and returns it with no level up and no KE creation', async function () {
              const evaluatedAnswer = await evaluateAndSaveAnswer({
                certificationCourseId,
                userId,
                answer: currentAnswer,
              });

              expect(evaluatedAnswer.assessmentId).to.equal(assessmentId);
              expect(evaluatedAnswer.challengeId).to.equal(challengeIdToAnswer);
              expect(evaluatedAnswer.isFocusedOut).to.be.false;
              expect(evaluatedAnswer.levelup).to.deep.equal({});
              expect(evaluatedAnswer.isOk()).to.be.true;
              const answerExistsInDB = await knex('answers').select('*').where({ id: evaluatedAnswer.id }).first();
              expect(Boolean(answerExistsInDB)).to.be.true;
              const keInDB = await knex('knowledge-elements').pluck('id');
              expect(keInDB).to.have.length(0);
            });

            it('updates the lastAnswerAt date to answer creation date', async function () {
              const evaluatedAnswer = await evaluateAndSaveAnswer({
                certificationCourseId,
                userId,
                answer: currentAnswer,
              });

              const [answerCreatedAt] = await knex('answers').pluck('createdAt').where({ id: evaluatedAnswer.id });
              const [lastAnswerAt] = await knex('certification-courses')
                .pluck('lastAnswerAt')
                .where({ id: certificationCourseId });
              expect(lastAnswerAt).to.deep.equal(answerCreatedAt);
            });
          });
        });
      });
    });
  });
});
