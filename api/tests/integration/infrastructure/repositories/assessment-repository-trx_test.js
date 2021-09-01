const { expect, knex, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');

const AssessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository-trx');
const Assessment = require('../../../../lib/domain/models/Assessment');
const moment = require('moment');
const _ = require('lodash');
const Answer = require('../../../../lib/domain/models/Answer');
const { NotFoundError } = require('../../../../lib/domain/errors');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');

describe('Integration | Infrastructure | Repositories | assessment-repository', function() {
  let assessmentRepository;
  beforeEach(function() {
    assessmentRepository = new AssessmentRepository(knex);
  });

  describe('#save', function() {
    let userId;
    let certificationCourseId;
    let assessmentToBeSaved;

    beforeEach(function() {
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

    afterEach(function() {
      knex('assessment-results').delete();
      return knex('assessments').delete();
    });

    it('should save new assessment if not already existing', async function() {
      // when
      await assessmentRepository.save({ assessment: assessmentToBeSaved });

      // then
      const assessmentsInDb = await knex('assessments').where({ userId }).first();
      expect(parseInt(assessmentsInDb.userId)).to.equal(userId);
      expect(parseInt(assessmentsInDb.courseId)).to.equal(certificationCourseId);
      expect(assessmentsInDb.type).to.equal(Assessment.types.CERTIFICATION);
      expect(assessmentsInDb.state).to.equal(Assessment.states.COMPLETED);
    });
  });

  describe('#getWithAnswersAndCampaignParticipation', () => {

    let assessmentId;

    context('when the assessment exists', () => {

      beforeEach(async () => {
        const dateOfFirstAnswer = moment.utc().subtract(2, 'minute').toDate();
        const dateOfSecondAnswer = moment.utc().subtract(1, 'minute').toDate();
        const dateOfThirdAnswer = moment.utc().toDate();

        assessmentId = databaseBuilder.factory.buildAssessment({
          courseId: 'course_A',
          state: 'completed',
        }).id;

        _.each([
          { assessmentId, value: '3,1', result: 'ko', challengeId: 'challenge_3_1', createdAt: dateOfFirstAnswer },
          { assessmentId, value: '1,4', result: 'ko', challengeId: 'challenge_1_4', createdAt: dateOfSecondAnswer },
          { assessmentId, value: '2,8', result: 'ko', challengeId: 'challenge_2_8', createdAt: dateOfThirdAnswer },
          { value: '5,2', result: 'ko', challengeId: 'challenge_4' },
        ], (answer) => {
          databaseBuilder.factory.buildAnswer(answer);
        });

        await databaseBuilder.commit();
      });

      it('should return the assessment with the answers sorted by creation date ', async () => {
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
      });
    });

    context('when there is a participation', async () => {
      it('should return the assessment with the answers sorted by creation date ', async () => {
        // when
        databaseBuilder.factory.buildCampaign({ id: 1, title: 'Champions League' });
        databaseBuilder.factory.buildCampaignParticipation();
        databaseBuilder.factory.buildCampaignParticipation({ id: 2, campaignId: 1 });
        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ campaignParticipationId: 2 });

        await databaseBuilder.commit();

        const assessment = await assessmentRepository.getWithAnswersAndCampaignParticipation(assessmentId);

        // then
        expect(assessment.campaignParticipation.id).to.equal(2);
        expect(assessment.campaignParticipation.campaign.title).to.equal('Champions League');
      });
    });

    context('when the assessment does not exist', () => {
      it('should return null', async () => {
        // when
        const assessment = await assessmentRepository.getWithAnswersAndCampaignParticipation(245);
        // then
        expect(assessment).to.equal(null);
      });
    });
  });

  describe('#get', () => {

    let assessmentId;

    context('when the assessment exists', () => {

      beforeEach(async () => {
        databaseBuilder.factory.buildAssessment();
        assessmentId = databaseBuilder.factory.buildAssessment({ courseId: 'course_A' }).id;
        await databaseBuilder.commit();
      });

      it('should return the assessment', async () => {
        // when
        const assessment = await assessmentRepository.get(assessmentId);

        // then
        expect(assessment).to.be.an.instanceOf(Assessment);
        expect(assessment.id).to.equal(assessmentId);
        expect(assessment.courseId).to.equal('course_A');
      });
    });

    context('when the assessment does not exist', () => {
      it('should return null', async () => {
        // when
        const error = await catchErr(assessmentRepository.get, assessmentRepository)(245);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#findLastCompletedAssessmentsForEachCompetenceByUser', () => {

    let johnUserId;
    let laylaUserId;
    let johnAssessmentToRemember;

    const PLACEMENT = 'PLACEMENT';

    const limitDate = moment.utc().toDate();
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

    const lastQuestionDate = moment('2021-03-10').toDate();

    // TODO: test with malformed data, e.g.:
    // - completed assessments without an AssessmentResult

    before(async () => {
      johnUserId = databaseBuilder.factory.buildUser().id;
      laylaUserId = databaseBuilder.factory.buildUser().id;

      johnAssessmentToRemember = databaseBuilder.factory.buildAssessment({
        userId: johnUserId,
        competenceId: 'competenceId1',
        state: Assessment.states.COMPLETED,
        createdAt: johnAssessmentDateToRemember,
        type: 'PLACEMENT',
        lastQuestionDate,
      });
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: johnAssessmentToRemember.id,
        createdAt: johnAssessmentResultDateToRemember,
        emitter: 'PIX',
        status: AssessmentResult.status.VALIDATED,
      });

      _.each([
        {
          assessment: {
            userId: johnUserId,
            competenceId: 'competenceId1',
            courseId: 'do-not-use-courseId',
            createdAt: dateAssessmentBefore1,
            state: Assessment.states.COMPLETED,
            type: PLACEMENT,
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
          },
          assessmentResult: {
            createdAt: dateAssessmentResultBefore3,
            emitter: 'PIX',
            status: AssessmentResult.status.VALIDATED,
          },
        },
      ], ({ assessment, assessmentResult }) => {
        const assessmentId = databaseBuilder.factory.buildAssessment(assessment).id;
        databaseBuilder.factory.buildAssessmentResult({ ...assessmentResult, assessmentId });
      });

      await databaseBuilder.commit();
    });

    it('should correctly query Assessment conditions', async () => {
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
          campaignParticipationId: null,
          certificationCourseId: null,
          competenceId: johnAssessmentToRemember.competenceId,
          assessmentResults: [],
        }),
      ];

      // when
      const assessments = await assessmentRepository.findLastCompletedAssessmentsForEachCompetenceByUser(johnUserId, limitDate);

      // then
      const assessmentsWithoutUserId = _.map(assessments, (assessment) => _.omit(assessment, ['userId', 'updatedAt']));
      const expectedAssessmentsWithoutUserId = _.map(expectedAssessments, (assessment) => _.omit(assessment, ['userId', 'updatedAt']));
      expect(assessmentsWithoutUserId).to.deep.equal(expectedAssessmentsWithoutUserId);
    });
  });

  describe('#getByAssessmentIdAndUserId', () => {

    describe('when userId is provided,', () => {
      let userId;
      let assessmentId;

      before(async () => {
        userId = databaseBuilder.factory.buildUser({}).id;
        assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
          courseId: 'courseId',
        }).id;

        await databaseBuilder.commit();
      });

      it('should fetch relative assessment ', async () => {
        // when
        const assessment = await assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId);

        // then
        expect(assessment).to.be.an.instanceOf(Assessment);
        expect(assessment.id).to.equal(assessmentId);
        expect(parseInt(assessment.userId)).to.equal(userId);
      });
    });

    describe('when userId is null,', () => {
      const userId = null;
      let assessmentId;

      before(async () => {
        assessmentId = databaseBuilder.factory.buildAssessment(
          {
            userId,
            courseId: 'courseId',
          }).id;
        await databaseBuilder.commit();
      });

      it('should fetch relative assessment', async () => {
        // when
        const assessment = await assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId);

        // then
        expect(assessment).to.be.an.instanceOf(Assessment);
        expect(assessment.id).to.equal(assessmentId);
        expect(assessment.userId).to.be.null;
      });
    });

  });

  describe.only('#getIdByCertificationCourseId', async () => {
    let userId;
    let certificationCourseId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
      return databaseBuilder.commit();
    });

    context('When the assessment for this certificationCourseId exists', () => {
      let assessmentId;

      beforeEach(() => {
        assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
          certificationCourseId,
          type: Assessment.types.CERTIFICATION,
        }).id;

        return databaseBuilder.commit();
      });

      it('should return the assessment for the given certificationCourseId', async () => {

        // when
        const returnedAssessmentId = await assessmentRepository.getIdByCertificationCourseId(certificationCourseId);

        // then
        expect(returnedAssessmentId).to.equal(assessmentId);
      });

    });

    context('When there are no assessment for this certification course id', () => {

      it('should return null', async () => {
      // when
        const assessment = await assessmentRepository.getIdByCertificationCourseId(1);

        // then
        expect(assessment).to.equal(null);
      });
    });
  });
});
