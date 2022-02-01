const { expect, knex, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const _ = require('lodash');
const moment = require('moment');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const { NotFoundError } = require('../../../../lib/domain/errors');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const Answer = require('../../../../lib/domain/models/Answer');
const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');

describe('Integration | Infrastructure | Repositories | assessment-repository', function () {
  afterEach(async function () {
    await knex('answers').delete();
    await knex('assessment-results').delete();
    return knex('assessments').delete();
  });

  describe('#getWithAnswersAndCampaignParticipation', function () {
    let assessmentId;

    context('when the assessment exists', function () {
      beforeEach(async function () {
        const dateOfFirstAnswer = moment.utc().subtract(3, 'minute').toDate();
        const dateOfSecondAnswer = moment.utc().subtract(2, 'minute').toDate();
        const dateOfThirdAnswer = moment.utc().subtract(1, 'minute').toDate();
        moment.utc().toDate();
        const dateOfFourthAnswer = moment.utc().toDate();

        assessmentId = databaseBuilder.factory.buildAssessment({
          courseId: 'course_A',
          state: 'completed',
        }).id;

        _.each(
          [
            { assessmentId, value: '3,1', result: 'ko', challengeId: 'challenge_3_1', createdAt: dateOfFirstAnswer },
            { assessmentId, value: '1,4', result: 'ko', challengeId: 'challenge_1_4', createdAt: dateOfSecondAnswer },
            { assessmentId, value: '2,8', result: 'ko', challengeId: 'challenge_2_8', createdAt: dateOfThirdAnswer },
            { assessmentId, value: '2,9', result: 'ko', challengeId: 'challenge_2_8', createdAt: dateOfFourthAnswer },
            { value: '5,2', result: 'ko', challengeId: 'challenge_4' },
          ],
          (answer) => {
            databaseBuilder.factory.buildAnswer(answer);
          }
        );

        await databaseBuilder.commit();
      });

      it('should return the assessment with the answers sorted by creation date ', async function () {
        // when
        const assessment = await assessmentRepository.getWithAnswersAndCampaignParticipation(assessmentId);

        // then
        expect(assessment).to.be.an.instanceOf(Assessment);
        expect(assessment.id).to.equal(assessmentId);
        expect(assessment.courseId).to.equal('course_A');

        expect(assessment.answers).to.have.lengthOf(3);
        expect(assessment.answers[0]).to.be.an.instanceOf(Answer);
        expect(assessment.answers[0].challengeId).to.equal('challenge_3_1');
        expect(assessment.answers[1].challengeId).to.equal('challenge_1_4');
        expect(assessment.answers[2].challengeId).to.equal('challenge_2_8');
        expect(assessment.answers[2].value).to.equal('2,8');
      });
    });

    context('when the assessment does not exist', function () {
      it('should return null', async function () {
        // when
        const assessment = await assessmentRepository.getWithAnswersAndCampaignParticipation(245);

        // then
        expect(assessment).to.equal(null);
      });
    });
  });

  describe('#get', function () {
    let assessmentId;

    context('when the assessment exists', function () {
      beforeEach(async function () {
        assessmentId = databaseBuilder.factory.buildAssessment({ courseId: 'course_A' }).id;
        await databaseBuilder.commit();
      });

      it('should return the assessment', async function () {
        // when
        const assessment = await assessmentRepository.get(assessmentId);

        // then
        expect(assessment).to.be.an.instanceOf(Assessment);
        expect(assessment.id).to.equal(assessmentId);
        expect(assessment.courseId).to.equal('course_A');
      });
    });

    context('when the assessment does not exist', function () {
      it('should return null', async function () {
        // when
        const error = await catchErr(assessmentRepository.get)(245);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#getByAssessmentIdAndUserId', function () {
    describe('when userId is provided,', function () {
      let userId;
      let assessmentId;

      before(async function () {
        userId = databaseBuilder.factory.buildUser({}).id;
        assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
          courseId: 'courseId',
        }).id;

        await databaseBuilder.commit();
      });

      it('should fetch relative assessment ', async function () {
        // when
        const assessment = await assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId);

        // then
        expect(assessment).to.be.an.instanceOf(Assessment);
        expect(assessment.id).to.equal(assessmentId);
        expect(parseInt(assessment.userId)).to.equal(userId);
      });
    });

    describe('when userId is null,', function () {
      const userId = null;
      let assessmentId;

      before(async function () {
        assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
          courseId: 'courseId',
        }).id;
        await databaseBuilder.commit();
      });

      it('should fetch relative assessment', async function () {
        // when
        const assessment = await assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId);

        // then
        expect(assessment).to.be.an.instanceOf(Assessment);
        expect(assessment.id).to.equal(assessmentId);
        expect(assessment.userId).to.be.null;
      });
    });
  });

  describe('#findLastCompletedAssessmentsForEachCompetenceByUser', function () {
    let johnUserId;
    let laylaUserId;
    let johnAssessmentToRemember;

    const PLACEMENT = 'PLACEMENT';
    let lastQuestionDate;
    let limitDate;

    // TODO: test with malformed data, e.g.:
    // - completed assessments without an AssessmentResult

    before(async function () {
      limitDate = moment.utc().toDate();

      const afterLimiteDate = moment(limitDate).add(1, 'day').toDate();
      const johnAssessmentResultDateToRemember = moment(limitDate).subtract(1, 'month').toDate();
      const johnAssessmentDateToRemember = moment(limitDate).subtract(2, 'month').toDate();
      const dateAssessmentBefore1 = moment(johnAssessmentDateToRemember).subtract(1, 'month').toDate();
      const dateAssessmentBefore2 = moment(johnAssessmentDateToRemember).subtract(2, 'month').toDate();
      const dateAssessmentBefore3 = moment(johnAssessmentDateToRemember).subtract(3, 'month').toDate();
      const dateAssessmentAfter = afterLimiteDate;

      const dateAssessmentResultBefore1 = moment(johnAssessmentResultDateToRemember).subtract(1, 'month').toDate();
      const dateAssessmentResultBefore2 = moment(johnAssessmentResultDateToRemember).subtract(2, 'month').toDate();
      const dateAssessmentResultBefore3 = moment(johnAssessmentResultDateToRemember).subtract(3, 'month').toDate();

      const dateAssessmentResultAfter1 = moment(afterLimiteDate).add(1, 'month').toDate();
      const dateAssessmentResultAfter2 = moment(afterLimiteDate).add(2, 'month').toDate();

      lastQuestionDate = moment('2021-03-10').toDate();

      johnUserId = databaseBuilder.factory.buildUser().id;
      laylaUserId = databaseBuilder.factory.buildUser().id;

      johnAssessmentToRemember = databaseBuilder.factory.buildAssessment({
        userId: johnUserId,
        competenceId: 'competenceId1',
        state: Assessment.states.COMPLETED,
        createdAt: johnAssessmentDateToRemember,
        type: 'PLACEMENT',
        lastQuestionDate,
        method: 'SMART_RANDOM',
      });
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: johnAssessmentToRemember.id,
        createdAt: johnAssessmentResultDateToRemember,
        emitter: 'PIX',
        status: AssessmentResult.status.VALIDATED,
      });

      _.each(
        [
          {
            assessment: {
              userId: johnUserId,
              competenceId: 'competenceId1',
              courseId: 'do-not-use-courseId',
              createdAt: dateAssessmentBefore1,
              state: Assessment.states.COMPLETED,
              type: PLACEMENT,
              method: 'SMART_RANDOM',
            },
            assessmentResult: {
              createdAt: dateAssessmentResultBefore1,
              emitter: 'PIX',
              status: AssessmentResult.status.VALIDATED,
            },
          },
          {
            assessment: {
              userId: johnUserId,
              competenceId: 'competenceId2',
              createdAt: dateAssessmentBefore2,
              state: Assessment.states.COMPLETED,
              type: PLACEMENT,
              method: 'SMART_RANDOM',
            },
            assessmentResult: {
              createdAt: dateAssessmentResultAfter1,
              emitter: 'PIX',
              status: AssessmentResult.status.VALIDATED,
            },
          },
          {
            assessment: {
              userId: johnUserId,
              competenceId: 'competenceId3',
              createdAt: dateAssessmentBefore3,
              state: Assessment.states.STARTED,
              type: PLACEMENT,
              method: 'SMART_RANDOM',
            },
            assessmentResult: {
              createdAt: dateAssessmentResultBefore2,
              emitter: 'PIX',
              status: AssessmentResult.status.VALIDATED,
            },
          },
          {
            assessment: {
              userId: johnUserId,
              competenceId: 'competenceId1',
              createdAt: dateAssessmentAfter,
              state: Assessment.states.COMPLETED,
              type: PLACEMENT,
              method: 'SMART_RANDOM',
            },
            assessmentResult: {
              createdAt: dateAssessmentResultAfter2,
              emitter: 'PIX',
              status: AssessmentResult.status.VALIDATED,
            },
          },
          {
            assessment: {
              userId: laylaUserId,
              competenceId: 'competenceId1',
              createdAt: dateAssessmentBefore1,
              state: Assessment.states.COMPLETED,
              type: PLACEMENT,
              method: 'SMART_RANDOM',
            },
            assessmentResult: {
              createdAt: dateAssessmentResultBefore3,
              emitter: 'PIX',
              status: AssessmentResult.status.VALIDATED,
            },
          },
        ],
        ({ assessment, assessmentResult }) => {
          const assessmentId = databaseBuilder.factory.buildAssessment(assessment).id;
          databaseBuilder.factory.buildAssessmentResult({ ...assessmentResult, assessmentId });
        }
      );

      await databaseBuilder.commit();
    });

    it('should correctly query Assessment conditions', async function () {
      // given
      const expectedAssessments = [
        new Assessment({
          id: johnAssessmentToRemember.id,
          userId: johnUserId,
          courseId: 'recDefaultCourseId',
          state: Assessment.states.COMPLETED,
          createdAt: johnAssessmentToRemember.createdAt,
          type: PLACEMENT,
          isImproving: false,
          lastQuestionDate,
          lastChallengeId: null,
          lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
          campaignParticipationId: null,
          certificationCourseId: null,
          competenceId: johnAssessmentToRemember.competenceId,
          assessmentResults: [],
          method: 'SMART_RANDOM',
        }),
      ];

      // when
      const assessments = await assessmentRepository.findLastCompletedAssessmentsForEachCompetenceByUser(
        johnUserId,
        limitDate
      );

      // then
      const assessmentsWithoutUserId = _.map(assessments, (assessment) => _.omit(assessment, ['userId', 'updatedAt']));
      const expectedAssessmentsWithoutUserId = _.map(expectedAssessments, (assessment) =>
        _.omit(assessment, ['userId', 'updatedAt'])
      );
      expect(assessmentsWithoutUserId).to.deep.equal(expectedAssessmentsWithoutUserId);
    });
  });

  describe('#save', function () {
    let userId;
    let certificationCourseId;
    let assessmentToBeSaved;
    let assessmentReturned;

    beforeEach(function () {
      userId = databaseBuilder.factory.buildUser().id;
      certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;

      assessmentToBeSaved = domainBuilder.buildAssessment({
        userId,
        courseId: certificationCourseId,
        type: Assessment.types.CERTIFICATION,
        state: Assessment.states.COMPLETED,
      });

      return databaseBuilder.commit();
    });

    it('should save new assessment if not already existing', async function () {
      // when
      assessmentReturned = await assessmentRepository.save({ assessment: assessmentToBeSaved });

      // then
      const assessmentsInDb = await knex('assessments').where('id', assessmentReturned.id).first('id', 'userId');
      expect(parseInt(assessmentsInDb.userId)).to.equal(userId);
    });
  });

  describe('#findNotAbortedCampaignAssessmentsByUserId', function () {
    let assessmentId;
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAssessment({
        userId,
        type: Assessment.types.CAMPAIGN,
        state: Assessment.states.ABORTED,
      });

      assessmentId = databaseBuilder.factory.buildAssessment({
        userId,
        type: Assessment.types.CAMPAIGN,
      }).id;

      await databaseBuilder.commit();
    });

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-sibling-hooks
    beforeEach(async function () {
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        assessmentId,
      });

      await databaseBuilder.commit();
    });

    it('should return the assessment with campaign when it matches with userId and ignore aborted assessments', async function () {
      // when
      const assessmentsReturned = await assessmentRepository.findNotAbortedCampaignAssessmentsByUserId(userId);

      // then
      expect(assessmentsReturned.length).to.equal(1);
      expect(assessmentsReturned[0]).to.be.an.instanceOf(Assessment);
      expect(assessmentsReturned[0].id).to.equal(assessmentId);
    });
  });

  describe('#findLastCampaignAssessmentByUserIdAndCampaignCode', function () {
    let assessmentId;
    let userId;
    let campaign;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();
    });

    context('when assessment do have campaign', function () {
      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildCampaign({
          name: 'Campagne',
          code: 'AZERTY',
        });

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign.id,
        });

        assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
          type: Assessment.types.CAMPAIGN,
          campaignParticipationId: campaignParticipation.id,
        }).id;

        await databaseBuilder.commit();
      });

      it('should return the assessment with campaign when asked', async function () {
        // when
        const assessmentReturned = await assessmentRepository.findLastCampaignAssessmentByUserIdAndCampaignCode({
          userId,
          campaignCode: campaign.code,
          includeCampaign: true,
        });

        // then
        expect(assessmentReturned).to.be.an.instanceOf(Assessment);
        expect(assessmentReturned.id).to.equal(assessmentId);
        expect(assessmentReturned.campaignParticipation.campaign.name).to.equal('Campagne');
      });

      it('should return the assessment without campaign', async function () {
        // when
        const assessmentReturned = await assessmentRepository.findLastCampaignAssessmentByUserIdAndCampaignCode({
          userId,
          campaignCode: campaign.code,
          includeCampaign: false,
        });

        // then
        expect(assessmentReturned).to.be.an.instanceOf(Assessment);
        expect(assessmentReturned.id).to.equal(assessmentId);
        expect(assessmentReturned.campaignParticipation).to.equal(undefined);
      });

      it('should return null', async function () {
        // when
        const assessmentReturned = await assessmentRepository.findLastCampaignAssessmentByUserIdAndCampaignCode({
          userId,
          campaignCode: 'fakeCampaignCode',
          includeCampaign: false,
        });

        // then
        expect(assessmentReturned).to.equal(null);
      });
    });

    context('when campaign is multipleSending', function () {
      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildCampaign({
          name: 'Campagne',
          code: 'AZERTY',
          multipleSendings: true,
        });

        const oldCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign.id,
          isImproved: true,
        });

        databaseBuilder.factory.buildAssessment({
          userId,
          type: Assessment.types.CAMPAIGN,
          campaignParticipationId: oldCampaignParticipation.id,
        }).id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign.id,
        });

        assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
          type: Assessment.types.CAMPAIGN,
          campaignParticipationId: campaignParticipation.id,
        }).id;

        await databaseBuilder.commit();
      });

      it('should return the assessment with last campaign launched', async function () {
        // when
        const assessmentReturned = await assessmentRepository.findLastCampaignAssessmentByUserIdAndCampaignCode({
          userId,
          campaignCode: campaign.code,
        });

        // then
        expect(assessmentReturned.id).to.equal(assessmentId);
      });
    });
  });

  describe('#completeByAssessmentId', function () {
    let assessmentId;

    beforeEach(function () {
      const userId = databaseBuilder.factory.buildUser().id;

      assessmentId = databaseBuilder.factory.buildAssessment({
        userId,
        type: Assessment.types.COMPETENCE_EVALUATION,
        state: Assessment.states.STARTED,
      }).id;

      return databaseBuilder.commit();
    });

    it('should complete an assessment if not already existing and commited', async function () {
      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        await assessmentRepository.completeByAssessmentId(assessmentId, domainTransaction);
      });

      // then
      const assessmentsInDb = await knex('assessments').where('id', assessmentId).first('state');
      expect(assessmentsInDb.state).to.equal(Assessment.states.COMPLETED);
    });

    it('should not complete an assessment if not already existing but rolled back', async function () {
      // when
      await catchErr(async () => {
        await DomainTransaction.execute(async (domainTransaction) => {
          await assessmentRepository.completeByAssessmentId(assessmentId, domainTransaction);
          throw new Error('an error occurs within the domain transaction');
        });
      });

      // then
      const assessmentsInDb = await knex('assessments').where('id', assessmentId).first('state');
      expect(assessmentsInDb.state).to.equal(Assessment.states.STARTED);
    });
  });

  describe('#endBySupervisorByAssessmentId', function () {
    it('should end an assessment', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;

      const assessmentId = databaseBuilder.factory.buildAssessment({
        userId,
        type: Assessment.types.COMPETENCE_EVALUATION,
        state: Assessment.states.STARTED,
      }).id;

      await databaseBuilder.commit();

      // when
      await assessmentRepository.endBySupervisorByAssessmentId(assessmentId);

      // then
      const { state } = await knex('assessments').where('id', assessmentId).first('state');
      expect(state).to.equal(Assessment.states.ENDED_BY_SUPERVISOR);
    });
  });

  describe('#ownedByUser', function () {
    let user;
    let userWithNoAssessment;
    let assessment;

    beforeEach(function () {
      user = databaseBuilder.factory.buildUser();
      assessment = databaseBuilder.factory.buildAssessment({ userId: user.id });
      userWithNoAssessment = databaseBuilder.factory.buildUser();
      return databaseBuilder.commit();
    });

    it('should resolve true if the given assessmentId belongs to the user', async function () {
      // when
      const ownedByUser = await assessmentRepository.ownedByUser({ id: assessment.id, userId: user.id });

      // then
      expect(ownedByUser).to.be.true;
    });

    it('should resolve false if the given assessmentId does not belong to the user', async function () {
      // when
      const ownedByUser = await assessmentRepository.ownedByUser({
        id: assessment.id,
        userId: userWithNoAssessment.id,
      });

      // then
      expect(ownedByUser).to.be.false;
    });

    it('should resolve true if the given assessmentId does not belong to any user and no user is specified', async function () {
      // given
      const assessmentWithoutUser = databaseBuilder.factory.buildAssessment({ userId: null });
      await databaseBuilder.commit();

      // when
      const ownedByUser = await assessmentRepository.ownedByUser({ id: assessmentWithoutUser.id, userId: null });

      // then
      expect(ownedByUser).to.be.true;
    });

    it('should resolve false if no assessment exists for provided assessmentId', async function () {
      // when
      const ownedByUser = await assessmentRepository.ownedByUser({ id: 123456, userId: 123 });

      // then
      expect(ownedByUser).to.be.false;
    });
  });

  describe('#updateLastQuestionDate', function () {
    it('should update lastQuestionDate', async function () {
      // given
      const lastQuestionDate = new Date();
      const assessment = databaseBuilder.factory.buildAssessment({
        lastQuestionDate: new Date('2020-01-10'),
      });
      await databaseBuilder.commit();

      // when
      await assessmentRepository.updateLastQuestionDate({ id: assessment.id, lastQuestionDate });

      // then
      const assessmentsInDb = await knex('assessments').where('id', assessment.id).first('lastQuestionDate');
      expect(assessmentsInDb.lastQuestionDate).to.deep.equal(lastQuestionDate);
    });

    context('when assessment does not exist', function () {
      it('should return null', async function () {
        const lastQuestionDate = new Date();
        const notExistingAssessmentId = 1;

        // when
        const result = await assessmentRepository.updateLastQuestionDate({
          id: notExistingAssessmentId,
          lastQuestionDate,
        });

        // then
        expect(result).to.equal(null);
      });
    });
  });

  describe('#updateWhenNewChallengeIsAsked', function () {
    it('should update lastChallengeId', async function () {
      // given
      const lastChallengeId = 'recLastChallenge';
      const assessment = databaseBuilder.factory.buildAssessment({
        lastChallengeId: 'recPreviousChallenge',
        lastQuestionState: 'focusedout',
      });
      await databaseBuilder.commit();

      // when
      await assessmentRepository.updateWhenNewChallengeIsAsked({ id: assessment.id, lastChallengeId });

      // then
      const assessmentsInDb = await knex('assessments').where('id', assessment.id).first();
      expect(assessmentsInDb.lastChallengeId).to.deep.equal(lastChallengeId);
      expect(assessmentsInDb.lastQuestionState).to.deep.equal(Assessment.statesOfLastQuestion.ASKED);
    });

    context('when assessment does not exist', function () {
      it('should return null', async function () {
        const notExistingAssessmentId = 1;

        // when
        const result = await assessmentRepository.updateWhenNewChallengeIsAsked({
          id: notExistingAssessmentId,
          lastChallengeId: 'test',
        });

        // then
        expect(result).to.equal(null);
      });
    });
  });

  describe('#updateLastQuestionState', function () {
    it('should update updateLastQuestionState', async function () {
      // given
      const assessment = databaseBuilder.factory.buildAssessment({
        lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
      });
      await databaseBuilder.commit();

      const lastQuestionState = 'timeout';

      // when
      await assessmentRepository.updateLastQuestionState({ id: assessment.id, lastQuestionState });

      // then
      const assessmentsInDb = await knex('assessments').where('id', assessment.id).first('lastQuestionState');
      expect(assessmentsInDb.lastQuestionState).to.equal(lastQuestionState);
    });

    context('when assessment does not exist', function () {
      it('should return null', async function () {
        const notExistingAssessmentId = 1;

        // when
        const result = await assessmentRepository.updateLastQuestionState({
          id: notExistingAssessmentId,
          lastQuestionState: 'timeout',
        });

        // then
        expect(result).to.equal(null);
      });
    });
  });

  describe('#getByCertificationCandidateId', function () {
    it("should return the user's assessment given its certification candidate id", async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession({}).id;
      const firstUserId = databaseBuilder.factory.buildUser({}).id;
      const secondUserId = databaseBuilder.factory.buildUser({}).id;

      const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        userId: firstUserId,
      }).id;

      const firstUserCertificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        userId: firstUserId,
      }).id;
      const secondUserCertificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        userId: secondUserId,
      }).id;

      const firstUserAssessmentId = databaseBuilder.factory.buildAssessment({
        userId: firstUserId,
        certificationCourseId: firstUserCertificationCourse,
        state: 'started',
        type: 'CERTIFICATION',
      }).id;
      databaseBuilder.factory.buildAssessment({
        userId: secondUserId,
        certificationCourseId: secondUserCertificationCourse,
        state: 'started',
        type: 'CERTIFICATION',
      });

      await databaseBuilder.commit();

      // when
      const assessment = await assessmentRepository.getByCertificationCandidateId(certificationCandidateId);

      // then
      expect(assessment).to.be.an.instanceOf(Assessment);
      expect(assessment.id).to.equal(firstUserAssessmentId);
      expect(assessment.certificationCourseId).to.equal(firstUserCertificationCourse);
      expect(assessment.userId).to.equal(firstUserId);
      expect(assessment.state).to.equal('started');
    });
  });
});
