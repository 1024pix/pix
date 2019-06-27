const { expect, sinon, knex, databaseBuilder, catchErr } = require('../../../test-helper');
const _ = require('lodash');
const moment = require('moment');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const Answer = require('../../../../lib/domain/models/Answer');
const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const BookshelfAssessment = require('../../../../lib/infrastructure/data/assessment');

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

      afterEach(async () => {
        await databaseBuilder.clean();
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

  describe('#findLastAssessmentsForEachCoursesByUser', () => {
    let johnUserId;
    let laylaUserId;
    let firstJohnAssessmentIdToRemember;
    let secondJohnAssessmentIdToRemember;

    beforeEach(async () => {
      johnUserId = databaseBuilder.factory.buildUser().id;
      laylaUserId = databaseBuilder.factory.buildUser().id;

      const oneMinuteBefore = moment.utc().subtract(1, 'minute').toDate();

      _.each([
        {
          userId: johnUserId,
          courseId: 'courseId1',
          state: Assessment.states.COMPLETED,
          type: Assessment.types.PLACEMENT,
          createdAt: oneMinuteBefore
        },
        {
          userId: johnUserId,
          courseId: 'courseId3',
          state: Assessment.states.COMPLETED,
          type: Assessment.types.CERTIFICATION,
          createdAt: moment.utc().toDate()
        },

        {
          userId: laylaUserId,
          courseId: 'courseId1',
          state: Assessment.states.COMPLETED,
          type: Assessment.types.PLACEMENT,
          createdAt: moment.utc().toDate()
        },
        {
          userId: laylaUserId,
          courseId: 'nullAssessmentPreview',
          state: Assessment.states.COMPLETED,
          type: Assessment.types.DEMO,
          createdAt: moment.utc().toDate()
        },
      ], (assessment) => {
        databaseBuilder.factory.buildAssessment(assessment);
      });

      firstJohnAssessmentIdToRemember = databaseBuilder.factory.buildAssessment({
        userId: johnUserId,
        courseId: 'courseId1',
        state: Assessment.states.COMPLETED,
        type: Assessment.types.PLACEMENT,
        createdAt: moment.utc().toDate(),
      }).id;

      secondJohnAssessmentIdToRemember = databaseBuilder.factory.buildAssessment({
        userId: johnUserId,
        courseId: 'courseId2',
        state: Assessment.states.COMPLETED,
        type: Assessment.types.PLACEMENT,
        createdAt: moment.utc().toDate(),
      }).id;

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return only the last assessment (which are not Certifications) for each courses from JOHN', async () => {
      // when
      const assessments = await assessmentRepository.findLastAssessmentsForEachCoursesByUser(johnUserId);

      // then
      expect(assessments).to.have.lengthOf(2);

      const firstId = assessments[0].id;
      expect(firstId).to.equal(firstJohnAssessmentIdToRemember);

      const secondId = assessments[1].id;
      expect(secondId).to.equal(secondJohnAssessmentIdToRemember);
    });

    it('should not return preview assessments', async () => {
      // when
      const assessments = await assessmentRepository.findLastAssessmentsForEachCoursesByUser(laylaUserId);

      // then
      expect(assessments).to.have.lengthOf(1);
    });

    it('should throw an error if something went wrong', async () => {
      // given
      const error = new Error('Unable to fetch');
      sinon.stub(BookshelfAssessment, 'collection').throws(error);

      // when
      const result = await catchErr(assessmentRepository.findLastAssessmentsForEachCoursesByUser)(johnUserId);

      // then
      expect(result).to.equal(error);
    });
  });

  describe('#findCompletedAssessmentsByUserId', () => {

    let johnUserId;
    let laylaUserId;
    let firstJohnCompletedAssessmentIdToRemember;
    let secondJohnCompletedAssessmentIdToRemember;

    before(async () => {
      johnUserId = databaseBuilder.factory.buildUser().id;
      laylaUserId = databaseBuilder.factory.buildUser().id;

      firstJohnCompletedAssessmentIdToRemember = databaseBuilder.factory.buildAssessment({
        userId: johnUserId,
        courseId: 'courseId',
        state: Assessment.states.COMPLETED,
        type: Assessment.types.PLACEMENT,
      }).id;
      secondJohnCompletedAssessmentIdToRemember = databaseBuilder.factory.buildAssessment({
        userId: johnUserId,
        courseId: 'courseId',
        state: Assessment.states.COMPLETED,
        type: Assessment.types.PLACEMENT,
      }).id;

      _.each([
        {
          userId: johnUserId,
          courseId: 'courseId',
          state: Assessment.states.STARTED,
          type: Assessment.types.PLACEMENT
        },
        {
          userId: johnUserId,
          courseId: 'courseId',
          state: Assessment.states.COMPLETED,
          type: Assessment.types.CERTIFICATION
        },
        {
          userId: laylaUserId,
          courseId: 'courseId',
          state: Assessment.states.COMPLETED,
          type: Assessment.types.PLACEMENT
        },
        {
          userId: laylaUserId,
          courseId: 'nullAssessmentPreview',
          state: Assessment.states.COMPLETED,
          type: Assessment.types.DEMO
        },
      ], (assessment) => {
        databaseBuilder.factory.buildAssessment(assessment);
      });

      await databaseBuilder.commit();
    });

    after(async () => {
      await databaseBuilder.clean();
    });

    it('should return the list of assessments (which are not Certifications) from JOHN', async () => {
      // when
      const assessments = await assessmentRepository.findCompletedAssessmentsByUserId(johnUserId);

      // then
      expect(assessments).to.have.lengthOf(2);

      expect(assessments[0]).to.be.an.instanceOf(Assessment);
      expect(assessments[1]).to.be.an.instanceOf(Assessment);

      expect(assessments[0].id).to.equal(firstJohnCompletedAssessmentIdToRemember);
      expect(assessments[1].id).to.equal(secondJohnCompletedAssessmentIdToRemember);
    });

    it('should not return preview assessments from LAYLA', async () => {
      // when
      const assessments = await assessmentRepository.findCompletedAssessmentsByUserId(laylaUserId);

      // then
      expect(assessments).to.have.lengthOf(1);
    });

    it('should throw an error if something went wrong', async () => {
      // given
      const error = new Error('Unable to fetch');
      sinon.stub(BookshelfAssessment, 'query').throws(error);

      // when
      const result = await catchErr(assessmentRepository.findCompletedAssessmentsByUserId)(johnUserId);

      // then
      expect(result).to.equal(error);
    });
  });

  describe('#getByAssessmentIdAndUserId', () => {

    describe('when userId is provided,', () => {
      let userId;
      let assessmentId;

      before(async () => {
        userId = databaseBuilder.factory.buildUser().id;
        assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
          courseId: 'courseId',
        }).id;

        await databaseBuilder.commit();
      });

      after(async () => {
        await databaseBuilder.clean();
      });

      it('should fetch relative assessment ', async () => {
        // when
        const assessment = await assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId);

        // then
        expect(assessment).to.be.an.instanceOf(Assessment);
        expect(assessment.id).to.equal(assessmentId);
        expect(assessment.userId).to.equal(userId);
      });
    });

    describe('when userId is null,', () => {
      const userId = null;
      let assessmentId;

      before(async () => {
        const assessment = {
          userId,
          courseId: 'courseId',
        };

        const insertedAssessment = await knex('assessments')
          .insert(assessment)
          .returning('id');
        assessmentId = insertedAssessment.shift();
      });

      after(async () => {
        await knex('assessments').where('id', assessmentId).delete();
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

  describe('#findLastCompletedAssessmentsForEachCoursesByUser', () => {

    let johnUserId;
    let laylaUserId;
    let johnAssessmentToRemember;
    let johnAssessmentResultToRemember;

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
        courseId: 'courseId1',
        state: Assessment.states.COMPLETED,
        createdAt: johnAssessmentDateToRemember,
        type: Assessment.types.PLACEMENT,
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
            courseId: 'courseId1',
            createdAt: dateAssessmentBefore1,
            state: Assessment.states.COMPLETED,
            type: Assessment.types.PLACEMENT
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
            courseId: 'courseId2',
            createdAt: dateAssessmentBefore2,
            state: Assessment.states.COMPLETED,
            type: Assessment.types.PLACEMENT
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
            courseId: 'courseId3',
            createdAt: dateAssessmentBefore3,
            state: Assessment.states.STARTED,
            type: Assessment.types.PLACEMENT
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
            courseId: 'courseId1',
            createdAt: dateAssessmentAfter,
            state: Assessment.states.COMPLETED,
            type: Assessment.types.PLACEMENT
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
            courseId: 'courseId1',
            createdAt: dateAssessmentBefore1,
            state: Assessment.states.COMPLETED,
            type: Assessment.types.PLACEMENT
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

    after(async () => {
      await databaseBuilder.clean();
    });

    it('should correctly query Assessment conditions', async () => {
      // given
      const expectedAssessments = [
        new Assessment({
          id: johnAssessmentToRemember.id,
          userId: johnUserId,
          courseId: johnAssessmentToRemember.courseId,
          state: Assessment.states.COMPLETED,
          createdAt: johnAssessmentToRemember.createdAt,
          type: Assessment.types.PLACEMENT,
          competenceId: johnAssessmentToRemember.competenceId,
          campaignParticipation: null,
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
      const assessments = await assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser(johnUserId, limitDate);

      // then
      expect(assessments).to.deep.equal(expectedAssessments);
    });
  });

  describe('#save', () => {

    let userId;
    let assessmentToBeSaved;
    let assessmentReturned;

    before(async () => {
      userId = databaseBuilder.factory.buildUser().id;

      assessmentToBeSaved = new Assessment({
        userId,
        courseId: 'courseId1',
        type: Assessment.types.CERTIFICATION,
        state: Assessment.states.COMPLETED,
      });

      await databaseBuilder.commit();
    });

    after(async () => {
      await knex('assessments').where('id', assessmentReturned.id).delete();
      await databaseBuilder.clean();
    });

    it('should save new assessment if not already existing', async () => {
      // when
      assessmentReturned = await assessmentRepository.save(assessmentToBeSaved);

      // then
      const assessmentsInDb = await knex('assessments').where('id', assessmentReturned.id).first('id', 'userId');
      expect(assessmentsInDb.userId).to.equal(userId);
    });
  });

  describe('#getByCertificationCourseId', async () => {

    let assessmentResult;

    before(async () => {
      const assessmentId = databaseBuilder.factory.buildAssessment({
        courseId: 'course_A',
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CERTIFICATION,
      }).id;

      assessmentResult = databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        level: 0,
        pixScore: 0,
        status: 'validated',
        emitter: 'PIX-ALGO',
        juryId: 1,
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

      await databaseBuilder.commit();
    });

    after(async () => {
      await databaseBuilder.clean();
    });

    it('should returns assessment results for the given certificationId', async () => {
      // given
      const expectedAssessmentResult = { ...assessmentResult, competenceMarks: [] };

      // when
      const assessmentReturned = await assessmentRepository.getByCertificationCourseId('course_A');

      // then
      expect(assessmentReturned).to.be.an.instanceOf(Assessment);
      expect(assessmentReturned.courseId).to.equal('course_A');
      expect(assessmentReturned.getPixScore()).to.equal(assessmentResult.pixScore);
      expect(assessmentReturned.assessmentResults).to.have.lengthOf(1);
      expect(assessmentReturned.assessmentResults[0]).to.deep.equal(expectedAssessmentResult);
    });
  });

  describe('#findOneCertificationAssessmentByUserIdAndCourseId', () => {

    const courseId = 'recCourseId1';

    let userId;
    let assessmentId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      assessmentId = databaseBuilder.factory.buildAssessment({
        userId,
        courseId,
        type: Assessment.types.CERTIFICATION,
      }).id;

      _.each([
        { userId, courseId, type: Assessment.types.PLACEMENT },
        { userId, type: Assessment.types.CERTIFICATION },
        { courseId, type: Assessment.types.CERTIFICATION },
      ], (assessment) => {
        databaseBuilder.factory.buildAssessment(assessment);
      });

      _.each([
        { assessmentId }, { assessmentId },
      ], (answer) => {
        databaseBuilder.factory.buildAnswer(answer);
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return assessment with answers when it matches with userId and courseId', async () => {
      // when
      const assessment = await assessmentRepository.findOneCertificationAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      expect(assessment.id).to.equal(assessmentId);
      expect(assessment.answers).to.have.lengthOf(2);
    });

    it('should return null when it does not match with userId and courseId', async () => {
      // given
      const userId = 234;
      const courseId = 'inexistantId';

      // when
      const assessment = await assessmentRepository.findOneCertificationAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      expect(assessment).to.equal(null);
    });
  });

  describe('#getByCampaignParticipationId', () => {

    let assessmentId;
    let campaignParticipationId;

    before(async () => {
      assessmentId = databaseBuilder.factory.buildAssessment({ type: Assessment.types.SMARTPLACEMENT }).id;
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ assessmentId }).id;

      const otherAssessmentId = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.SMARTPLACEMENT
      }).id;

      databaseBuilder.factory.buildCampaignParticipation({ assessmentId: otherAssessmentId });

      await databaseBuilder.commit();
    });

    after(async () => {
      await databaseBuilder.clean();
    });

    it('should return assessment with campaignParticipation when it matches with campaignParticipationId', async () => {
      // when
      const assessmentsReturned = await assessmentRepository.getByCampaignParticipationId(campaignParticipationId);

      // then
      expect(assessmentsReturned).to.be.an.instanceOf(Assessment);
      expect(assessmentsReturned.campaignParticipation).to.be.an.instanceOf(CampaignParticipation);
      expect(assessmentsReturned.campaignParticipation.id).to.equal(campaignParticipationId);
      expect(assessmentsReturned.campaignParticipation.assessmentId).to.equal(assessmentId);
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

    after(async () => {
      await databaseBuilder.clean();
    });

    it('should returns the assessment with campaign when it matches with userId', async () => {
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

      assessmentId = databaseBuilder.factory.buildAssessment({
        userId,
        type: Assessment.types.SMARTPLACEMENT,
      }).id;

      await databaseBuilder.commit();
    });

    context('when assessment do have campaign', () => {
      beforeEach(async () => {
        campaign = databaseBuilder.factory.buildCampaign({
          name: 'Campagne',
          code: 'AZERTY',
        });

        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          assessmentId,
          campaignId: campaign.id,
        });

        await databaseBuilder.commit();
      });

      after(async () => {
        await databaseBuilder.clean();
      });

      it('should returns the assessment with campaign when asked', async () => {
        // when
        const assessmentReturned = await assessmentRepository.findLastSmartPlacementAssessmentByUserIdAndCampaignCode({ userId, campaignCode: campaign.code, includeCampaign: true });

        // then
        expect(assessmentReturned).to.be.an.instanceOf(Assessment);
        expect(assessmentReturned.id).to.equal(assessmentId);
        expect(assessmentReturned.campaignParticipation.campaign.name).to.equal('Campagne');
      });

      it('should returns the assessment without campaign', async () => {
        // when
        const assessmentReturned = await assessmentRepository.findLastSmartPlacementAssessmentByUserIdAndCampaignCode({ userId, campaignCode: campaign.code, includeCampaign: false });

        // then
        expect(assessmentReturned).to.be.an.instanceOf(Assessment);
        expect(assessmentReturned.id).to.equal(assessmentId);
        expect(assessmentReturned.campaignParticipation).to.equal(undefined);
      });

      it('should returns null', async () => {
        // when
        const assessmentReturned = await assessmentRepository.findLastSmartPlacementAssessmentByUserIdAndCampaignCode({ userId, campaignCode: 'fakeCampaignCode', includeCampaign: false });

        // then
        expect(assessmentReturned).to.equal(null);
      });
    });
  });

  describe('#findOneLastPlacementAssessmentByUserIdAndCourseId', () => {

    const courseId = 'rec23kfr5hfD54f';
    let userId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return null if nothing found', async () => {
      // when
      const foundAssessment = await assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      expect(foundAssessment).to.be.null;
    });

    it('should return a placement regarding the given userId', async () => {
      // given
      const assessmentId = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId,
        courseId,
      }).id;

      databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        courseId,
      });

      await databaseBuilder.commit();

      // when
      const foundAssessment = await assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      expect(foundAssessment.id).to.equal(assessmentId);
    });

    it('should return a placement concerning the given courseId', async () => {
      // given
      const assessmentId = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId,
        courseId,
      }).id;

      databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId,
        courseId: 'wrongRec',
      });

      await databaseBuilder.commit();

      // when
      const foundAssessment = await assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      expect(foundAssessment.id).to.equal(assessmentId);
    });

    it('should return an assessment of type placement', async () => {
      // given
      const assessmentId = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId,
        courseId,
      }).id;

      databaseBuilder.factory.buildAssessment({
        type: Assessment.types.SMARTPLACEMENT,
        userId,
        courseId,
      });

      await databaseBuilder.commit();

      // when
      const foundAssessment = await assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      expect(foundAssessment.id).to.equal(assessmentId);
    });

    it('should return the last placement concerning the userId and courseId', async () => {
      // given
      const today = moment.utc().toDate();
      const pastDate1 = moment(today).subtract(1, 'day').toDate();
      const pastDate2 = moment(today).subtract(2, 'day').toDate();

      const assessmentId = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId,
        courseId,
        createdAt: today,
      }).id;

      _.each([
        { userId, courseId, type: Assessment.types.PLACEMENT, createdAt: pastDate1 },
        { userId, courseId, type: Assessment.types.PLACEMENT, createdAt: pastDate2 },
      ], (assessment) => {
        databaseBuilder.factory.buildAssessment(assessment);
      });

      await databaseBuilder.commit();

      // when
      const foundAssessment = await assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      expect(foundAssessment.id).to.deep.equal(assessmentId);
    });

    it('should fetch the related assessment results', async () => {
      // given
      const assessmentId = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId,
        courseId,
      }).id;

      _.each([
        { assessmentId }, { assessmentId },
      ], (assessmentResult) => {
        databaseBuilder.factory.buildAssessmentResult(assessmentResult);
      });

      await databaseBuilder.commit();

      // when
      const foundAssessment = await assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      expect(foundAssessment.assessmentResults).to.have.length.of(2);
    });
  });

  describe('#hasCampaignOrCompetenceEvaluation', () => {

    let userId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    context('when user has only PLACEMENT assessment', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildAssessment({
          userId,
          type: Assessment.types.PLACEMENT,
        });

        await databaseBuilder.commit();
      });

      it('should returns the assessment with campaign when it matches with userId', async () => {
        // when
        const result = await assessmentRepository.hasCampaignOrCompetenceEvaluation(userId);

        // then
        expect(result).to.be.false;
      });
    });

    context('when user has SMART_PLACEMENT assessment', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildAssessment({
          userId,
          type: Assessment.types.SMARTPLACEMENT,
        });

        await databaseBuilder.commit();
      });

      it('should returns the assessment with campaign when it matches with userId', async () => {
        // when
        const result = await assessmentRepository.hasCampaignOrCompetenceEvaluation(userId);

        // then
        expect(result).to.be.true;
      });
    });

    context('when user has COMPETENCE_EVALUATION assessment', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildAssessment({
          userId,
          type: Assessment.types.COMPETENCE_EVALUATION,
        });

        await databaseBuilder.commit();
      });

      it('should returns the assessment with campaign when it matches with userId', async () => {
        // when
        const result = await assessmentRepository.hasCampaignOrCompetenceEvaluation(userId);

        // then
        expect(result).to.be.true;
      });
    });

    context('when user has both SMART_PLACEMENT or COMPETENCE_EVALUATION assessment', () => {
      beforeEach(async () => {
        _.each([
          { userId, type: Assessment.types.SMARTPLACEMENT },
          { userId, type: Assessment.types.COMPETENCE_EVALUATION },
        ], (assessment) => {
          databaseBuilder.factory.buildAssessment(assessment);
        });

        await databaseBuilder.commit();
      });

      it('should returns the assessment with campaign when it matches with userId', async () => {
        // when
        const result = await assessmentRepository.hasCampaignOrCompetenceEvaluation(userId);

        // then
        expect(result).to.be.true;
      });
    });
  });

});
