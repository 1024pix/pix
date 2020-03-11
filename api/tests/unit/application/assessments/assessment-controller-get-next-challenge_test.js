const { sinon, expect, domainBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const certificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');
const usecases = require('../../../../lib/domain/usecases');
const { AssessmentEndedError } = require('../../../../lib/domain/errors');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Controller | assessment-controller-get-next-challenge', () => {

  describe('#getNextChallenge', () => {
    let assessmentWithoutScore;
    let assessmentWithScore;
    let scoredAsssessment;

    beforeEach(() => {

      assessmentWithoutScore = new Assessment({
        id: 1,
        courseId: 'recHzEA6lN4PEs7LG',
        userId: 5,
        type: 'DEMO',
      });

      assessmentWithScore = new Assessment({
        id: 1,
        courseId: 'recHzEA6lN4PEs7LG', userId: 5,
        estimatedLevel: 0,
        pixScore: 0,
      });

      scoredAsssessment = {
        assessmentPix: assessmentWithScore,
      };

      sinon.stub(assessmentRepository, 'get');
      sinon.stub(challengeRepository, 'get').resolves({});

      sinon.stub(usecases, 'getAssessment').resolves(scoredAsssessment);
      sinon.stub(usecases, 'getNextChallengeForCertification').resolves();
      sinon.stub(usecases, 'getNextChallengeForDemo').resolves();
      sinon.stub(usecases, 'getNextChallengeForSmartPlacement').resolves();
      sinon.stub(usecases, 'getNextChallengeForCompetenceEvaluation').resolves();
      sinon.stub(certificationChallengeRepository, 'getNonAnsweredChallengeByCourseId').resolves();
    });

    // TODO: Que faire si l'assessment n'existe pas pas ?

    describe('when the assessment is a preview', () => {

      const PREVIEW_ASSESSMENT_ID = 245;

      beforeEach(() => {
        assessmentRepository.get.resolves(new Assessment({
          id: 1,
          courseId: 'null2356871',
          userId: 5,
          estimatedLevel: 0,
          pixScore: 0,
          type: 'PREVIEW',
        }));
      });

      it('should return a null data directly', async () => {
        // when
        const response = await assessmentController.getNextChallenge({ params: { id: PREVIEW_ASSESSMENT_ID } });

        // then
        expect(response).to.deep.equal({ data: null });
      });
    });

    describe('when the assessment is over', () => {

      beforeEach(() => {
        usecases.getNextChallengeForCertification.rejects(new AssessmentEndedError());
        usecases.getNextChallengeForDemo.rejects(new AssessmentEndedError());
        assessmentRepository.get.resolves(assessmentWithoutScore);
        usecases.getAssessment.resolves(scoredAsssessment);
      });

      context('when the assessment is a DEMO', () => {
        it('should reply with no data', async () => {
          // when
          const response = await assessmentController.getNextChallenge({ params: { id: 7531 } });

          // then
          expect(response).to.deep.equal({ data: null });
        });
      });
    });

    describe('when the assessment is not over yet', () => {

      beforeEach(() => {
        assessmentRepository.get.resolves(assessmentWithoutScore);
      });

      it('should not evaluate assessment score', async () => {
        // when
        await assessmentController.getNextChallenge({ params: { id: 7531 } });

        // then
        expect(usecases.getAssessment).not.to.have.been.called;
      });

    });

    describe('when the assessment is a certification assessment', function() {

      const certificationAssessment = new Assessment({
        id: 'assessmentId',
        type: Assessment.types.CERTIFICATION,
      });

      beforeEach(() => {
        assessmentRepository.get.resolves(certificationAssessment);
      });

      it('should call getNextChallengeForCertificationCourse in assessmentService', async function() {
        // given
        usecases.getNextChallengeForCertification.resolves();

        // when
        await assessmentController.getNextChallenge({ params: { id: 12 } });

        // then
        expect(usecases.getNextChallengeForCertification).to.have.been.calledOnce;
        expect(usecases.getNextChallengeForCertification).to.have.been.calledWith({
          assessment: certificationAssessment,
        });
      });

      it('should reply null data when unable to find the next challenge', async () => {
        // given
        usecases.getNextChallengeForCertification.rejects(new AssessmentEndedError());

        // when
        const response = await assessmentController.getNextChallenge({ params: { id: 12 } });

        // then
        expect(response).to.deep.equal({ data: null });
      });
    });

    describe('when the assessment is a smart placement assessment', () => {

      const assessment = new Assessment({
        id: 1,
        courseId: 'courseId',
        userId: 5,
        type: 'SMART_PLACEMENT',
      });

      beforeEach(() => {
        assessmentRepository.get.resolves(assessment);
      });

      it('should call the usecase getNextChallengeForSmartPlacement with tryImproving at false when the query not exists', async () => {
        // when
        await assessmentController.getNextChallenge({ params: { id: 1 }, query: { } });

        // then
        expect(usecases.getNextChallengeForSmartPlacement).to.have.been.calledWith({
          assessment,
          tryImproving: false
        });
      });

      it('should call the usecase getNextChallengeForSmartPlacement with the query tryImproving', async () => {
        // when
        await assessmentController.getNextChallenge({ params: { id: 1 }, query: { tryImproving: true } });

        // then
        expect(usecases.getNextChallengeForSmartPlacement).to.have.been.calledWith({
          assessment,
          tryImproving: true
        });
      });
    });

    describe('when the assessment is a competence evaluation assessment', () => {
      const userId = 1;

      const assessment = domainBuilder.buildAssessment({
        id: 1,
        courseId: 'courseId',
        userId: 5,
        type: Assessment.types.COMPETENCE_EVALUATION,
      });

      beforeEach(() => {
        assessmentRepository.get.resolves(assessment);
      });

      it('should call the usecase getNextChallengeForCompetenceEvaluation', async () => {
        const request = {
          params: { id: 1 },
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) }
        };
        // when
        await assessmentController.getNextChallenge(request);

        // then
        expect(usecases.getNextChallengeForCompetenceEvaluation).to.have.been.calledWith({
          assessment,
          userId,
        });
      });
    });
  });
});
