const { expect, knex, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const _ = require('lodash');
const moment = require('moment');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const Answer = require('../../../../lib/domain/models/Answer');
const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');

describe('Integration | Infrastructure | Repositories | assessment-repository', () => {

  // TODO: rajouter la verif de l'ajout du profile dans le cas du SMART_PLACEMENT
  describe('#get', () => {

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
        const assessment = await assessmentRepository.get(assessmentId);

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

    context('when the assessment does not exist', () => {
      it('should return null', async () => {
        // when
        const assessment = await assessmentRepository.get(245);

        // then
        expect(assessment).to.equal(null);
      });
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

  describe('#findLastCompletedAssessmentsForEachCompetenceByUser', () => {

    let johnUserId;
    let laylaUserId;
    let johnAssessmentToRemember;
    let johnAssessmentResultToRemember;

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
      });

      johnAssessmentResultToRemember = databaseBuilder.factory.buildAssessmentResult({
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
            status: AssessmentResult.status.VALIDATED
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
            status: AssessmentResult.status.VALIDATED
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
            status: AssessmentResult.status.VALIDATED
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
            status: AssessmentResult.status.VALIDATED
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
            status: AssessmentResult.status.VALIDATED
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
          campaignParticipationId: null,
          certificationCourseId: null,
          competenceId: johnAssessmentToRemember.competenceId,
          assessmentResults: [
            {
              id: johnAssessmentResultToRemember.id,
              assessmentId: johnAssessmentToRemember.id,
              commentForCandidate: johnAssessmentResultToRemember.commentForCandidate,
              commentForJury: johnAssessmentResultToRemember.commentForJury,
              commentForOrganization: johnAssessmentResultToRemember.commentForOrganization,
              createdAt: johnAssessmentResultToRemember.createdAt,
              emitter: 'PIX',
              juryId: johnAssessmentResultToRemember.juryId,
              level: johnAssessmentResultToRemember.level,
              pixScore: johnAssessmentResultToRemember.pixScore,
              status: AssessmentResult.status.VALIDATED,
              competenceMarks: []
            }
          ]
        })
      ];

      // when
      const assessments = await assessmentRepository.findLastCompletedAssessmentsForEachCompetenceByUser(johnUserId, limitDate);

      // then
      const assessmentsWithoutUserId = _.map(assessments, (assessment) => _.omit(assessment, ['userId']));
      const expectedAssessmentsWithoutUserId = _.map(expectedAssessments, (assessment) => _.omit(assessment, ['userId']));
      expect(assessmentsWithoutUserId).to.deep.equal(expectedAssessmentsWithoutUserId);
    });
  });

  describe('#save', () => {
    let userId;
    let certificationCourseId;
    let assessmentToBeSaved;
    let assessmentReturned;

    beforeEach(() => {
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

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should save new assessment if not already existing', async () => {
      // when
      assessmentReturned = await assessmentRepository.save({ assessment: assessmentToBeSaved });

      // then
      const assessmentsInDb = await knex('assessments').where('id', assessmentReturned.id).first('id', 'userId');
      expect(parseInt(assessmentsInDb.userId)).to.equal(userId);
    });
  });

  describe('#getByCertificationCourseId', async () => {

    let userId;
    let certificationCourseId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
      return databaseBuilder.commit();
    });

    context('When the assessment for this certificationCourseId exists', () => {
      let assessmentId;
      let assessmentResult;

      beforeEach(() => {
        assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
          certificationCourseId,
          type: Assessment.types.CERTIFICATION,
        }).id;

        assessmentResult = databaseBuilder.factory.buildAssessmentResult({
          assessmentId,
          level: 0,
          pixScore: 0,
          status: 'validated',
          emitter: 'PIX-ALGO',
          commentForJury: 'Computed',
          commentForCandidate: 'Votre certification a été validé par Pix',
          commentForOrganization: 'Sa certification a été validé par Pix',
        });

        databaseBuilder.factory.buildCompetenceMark({
          assessmentResultId: assessmentResult.id,
          level: 4,
          score: 35,
          area_code: '2',
          competence_code: '2.1',
        });

        return databaseBuilder.commit();
      });

      it('should return the assessment for the given certificationCourseId', async () => {

        // when
        const assessmentReturned = await assessmentRepository.getByCertificationCourseId(certificationCourseId);

        // then
        expect(assessmentReturned.id).to.equal(assessmentId);
        expect(assessmentReturned.certificationCourseId).to.equal(certificationCourseId);
      });

      it('should return the appropriate assessment results', async () => {
        // given
        const expectedAssessmentResult = { ...assessmentResult, competenceMarks: [] };

        // when
        const assessmentReturned = await assessmentRepository.getByCertificationCourseId(certificationCourseId);

        // then
        expect(assessmentReturned.getPixScore()).to.equal(assessmentResult.pixScore);
        expect(assessmentReturned.assessmentResults).to.have.lengthOf(1);
        expect(assessmentReturned.assessmentResults[0]).to.deep.equal(expectedAssessmentResult);
      });

    });

    context('When there are no assessment for this certification course id', () => {

      it('should return null', async () => {
        // when
        const assessment = await assessmentRepository.getByCertificationCourseId(1);

        // then
        expect(assessment).to.equal(null);
      });
    });

  });

  describe('#getByCampaignParticipationId', () => {

    let campaignParticipationId;

    before(async () => {

      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({}).id;
      databaseBuilder.factory.buildAssessment({ type: Assessment.types.SMARTPLACEMENT, campaignParticipationId }).id;
      const otherAssessmentId = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.SMARTPLACEMENT
      }).id;

      databaseBuilder.factory.buildCampaignParticipation({ assessmentId: otherAssessmentId });

      await databaseBuilder.commit();
    });

    it('should return assessment with campaignParticipation when it matches with campaignParticipationId', async () => {
      // when
      const assessmentsReturned = await assessmentRepository.getByCampaignParticipationId(campaignParticipationId);

      // then
      expect(assessmentsReturned).to.be.an.instanceOf(Assessment);
      expect(assessmentsReturned.campaignParticipation).to.be.an.instanceOf(CampaignParticipation);
      expect(assessmentsReturned.campaignParticipation.id).to.equal(campaignParticipationId);
    });

  });

  describe('#findNotAbortedSmartPlacementAssessmentsByUserId', () => {
    let assessmentId;
    let userId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAssessment({
        userId,
        type: Assessment.types.SMARTPLACEMENT,
        state: Assessment.states.ABORTED
      });

      assessmentId = databaseBuilder.factory.buildAssessment({
        userId,
        type: Assessment.types.SMARTPLACEMENT,
      }).id;

      await databaseBuilder.commit();
    });

    beforeEach(async () => {
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        assessmentId,
      });

      await databaseBuilder.commit();
    });

    it('should return the assessment with campaign when it matches with userId and ignore aborted assessments', async () => {
      // when
      const assessmentsReturned = await assessmentRepository.findNotAbortedSmartPlacementAssessmentsByUserId(userId);

      // then
      expect(assessmentsReturned.length).to.equal(1);
      expect(assessmentsReturned[0]).to.be.an.instanceOf(Assessment);
      expect(assessmentsReturned[0].id).to.equal(assessmentId);
    });
  });

  describe('#findLastSmartPlacementAssessmentByUserIdAndCampaignCode', () => {
    let assessmentId;
    let userId;
    let campaign;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();
    });

    context('when assessment do have campaign', () => {
      beforeEach(async () => {
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
          type: Assessment.types.SMARTPLACEMENT,
          campaignParticipationId: campaignParticipation.id
        }).id;

        await databaseBuilder.commit();
      });

      it('should return the assessment with campaign when asked', async () => {
        // when
        const assessmentReturned = await assessmentRepository.findLastSmartPlacementAssessmentByUserIdAndCampaignCode({
          userId,
          campaignCode: campaign.code,
          includeCampaign: true
        });

        // then
        expect(assessmentReturned).to.be.an.instanceOf(Assessment);
        expect(assessmentReturned.id).to.equal(assessmentId);
        expect(assessmentReturned.campaignParticipation.campaign.name).to.equal('Campagne');
      });

      it('should return the assessment without campaign', async () => {
        // when
        const assessmentReturned = await assessmentRepository.findLastSmartPlacementAssessmentByUserIdAndCampaignCode({
          userId,
          campaignCode: campaign.code,
          includeCampaign: false
        });

        // then
        expect(assessmentReturned).to.be.an.instanceOf(Assessment);
        expect(assessmentReturned.id).to.equal(assessmentId);
        expect(assessmentReturned.campaignParticipation).to.equal(undefined);
      });

      it('should return null', async () => {
        // when
        const assessmentReturned = await assessmentRepository.findLastSmartPlacementAssessmentByUserIdAndCampaignCode({
          userId,
          campaignCode: 'fakeCampaignCode',
          includeCampaign: false
        });

        // then
        expect(assessmentReturned).to.equal(null);
      });
    });
  });

  describe('#completeByAssessmentId', () => {
    let assessmentId;

    beforeEach(() => {
      const userId = databaseBuilder.factory.buildUser().id;

      assessmentId = databaseBuilder.factory.buildAssessment({
        userId,
        type: Assessment.types.COMPETENCE_EVALUATION,
        state: Assessment.states.STARTED,
      }).id;

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should complete an assessment if not already existing and commited', async () => {
      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        await assessmentRepository.completeByAssessmentId(assessmentId, domainTransaction);
      });

      // then
      const assessmentsInDb = await knex('assessments').where('id', assessmentId).first('state');
      expect(assessmentsInDb.state).to.equal(Assessment.states.COMPLETED);
    });

    it('should not complete an assessment if not already existing but rolled back', async () => {
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

});
