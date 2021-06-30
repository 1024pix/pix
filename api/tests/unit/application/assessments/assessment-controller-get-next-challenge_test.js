const { sinon, expect, domainBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const certificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');
const questionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/question-serializer');
const usecases = require('../../../../lib/domain/usecases');
const { AssessmentEndedError } = require('../../../../lib/domain/errors');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Question = require('../../../../lib/domain/models/Question');
const { FRENCH_FRANCE, FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Unit | Controller | assessment-controller-get-next-challenge', () => {

  describe('#getNextChallenge', () => {
    let assessmentWithoutScore;
    let assessmentWithScore;
    let scoredAsssessment;
    let updateLastQuestionDateStub;

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
      updateLastQuestionDateStub = sinon.stub(assessmentRepository, 'updateLastQuestionDate');
      sinon.stub(challengeRepository, 'get').resolves({});

      sinon.stub(usecases, 'getAssessment').resolves(scoredAsssessment);
      sinon.stub(usecases, 'getNextChallengeForCertification').resolves();
      sinon.stub(usecases, 'getNextChallengeForDemo').resolves();
      sinon.stub(usecases, 'getNextChallengeForCampaignAssessment').resolves();
      sinon.stub(usecases, 'getNextChallengeForCompetenceEvaluation').resolves();
      sinon.stub(certificationChallengeRepository, 'getNextNonAnsweredChallengeByCourseId').resolves();
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

      const certificationAssessment = domainBuilder.buildAssessment({
        id: 'assessmentId',
        type: Assessment.types.CERTIFICATION,
      });

      beforeEach(() => {
        assessmentRepository.get.resolves(certificationAssessment);
      });

      it('should call getNextChallengeForCertificationCourse in assessmentService', async function() {
        // given
        const question = new Question({ challenge: domainBuilder.buildChallenge(), index: 4 });
        usecases.getNextChallengeForCertification.withArgs({ assessment: certificationAssessment })
          .resolves(question);
        sinon.stub(assessmentRepository, 'updateLastChallengeIdAsked').withArgs({
          id: certificationAssessment.id,
          lastChallengeId: question.challenge.id,
        }).resolves();

        // when
        const result = await assessmentController.getNextChallenge({ params: { id: 12 } });

        // then
        expect(result).to.deep.equal(questionSerializer.serialize(question));
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

    describe('when the assessment is a campaign assessment', () => {

      const defaultLocale = FRENCH_FRANCE;
      const assessment = new Assessment({
        id: 1,
        courseId: 'courseId',
        userId: 5,
        type: 'CAMPAIGN',
      });

      beforeEach(() => {
        assessmentRepository.get.resolves(assessment);
      });

      it('should call the usecase getNextChallengeForCampaignAssessment', async () => {
        // when
        await assessmentController.getNextChallenge({ params: { id: 1 } });

        // then
        expect(usecases.getNextChallengeForCampaignAssessment).to.have.been.calledWith({
          assessment,
          locale: defaultLocale,
        });
      });

      it('should call the usecase getNextChallengeForCampaignAssessment with the locale', async () => {
        // given
        const locale = FRENCH_SPOKEN;

        // when
        await assessmentController.getNextChallenge({
          params: { id: 1 },
          headers: {
            'accept-language': locale,
          },
        });

        // then
        expect(usecases.getNextChallengeForCampaignAssessment).to.have.been.calledWith({
          assessment,
          locale,
        });
      });
    });

    describe('when the assessment is a competence evaluation assessment', () => {

      describe('when assessment is started', () => {
        const userId = 1;

        const assessment = domainBuilder.buildAssessment({
          id: 1,
          courseId: 'courseId',
          userId: 5,
          type: Assessment.types.COMPETENCE_EVALUATION,
          state: 'started',
        });

        beforeEach(() => {
          assessmentRepository.get.resolves(assessment);
        });

        it('should call the usecase getNextChallengeForCompetenceEvaluation', async () => {
          const locale = FRENCH_SPOKEN;
          const request = {
            params: { id: 1 },
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
              'accept-language': locale,
            },
          };
          // when
          await assessmentController.getNextChallenge(request);

          // then
          expect(usecases.getNextChallengeForCompetenceEvaluation).to.have.been.calledWith({
            assessment,
            userId,
            locale,
          });
        });

        describe('when asking for a challenge', () => {
          const now = new Date('2019-01-01T05:06:07Z');
          let clock;

          beforeEach(() => {
            clock = sinon.useFakeTimers(now);
          });

          afterEach(() => {
            clock.restore();
          });

          it('should call assessmentRepository updateLastQuestionDate method with currentDate', async () => {
            // given
            const locale = FRENCH_SPOKEN;
            const request = {
              params: { id: 1 },
              headers: {
                authorization: generateValidRequestAuthorizationHeader(1),
                'accept-language': locale,
              },
            };

            // when
            await assessmentController.getNextChallenge(request);

            // then
            expect(updateLastQuestionDateStub).to.be.calledWith({ id: request.params.id, lastQuestionDate: now });
          });

        });

      });

      describe('when assessment is completed', () => {
        const assessment = domainBuilder.buildAssessment({
          id: 1,
          courseId: 'courseId',
          userId: 5,
          type: Assessment.types.COMPETENCE_EVALUATION,
          state: 'completed',
        });

        beforeEach(() => {
          assessmentRepository.get.resolves(assessment);
        });

        describe('#getNextChallenge', () => {
          it('should not call assessmentRepository updateLastQuestionDate method', async () => {
            // given
            const locale = FRENCH_SPOKEN;
            const request = {
              params: { id: 1 },
              headers: {
                authorization: generateValidRequestAuthorizationHeader(1),
                'accept-language': locale,
              },
            };

            // when
            await assessmentController.getNextChallenge(request);

            // then
            expect(updateLastQuestionDateStub).to.have.not.been.called;
          });
        });
      });
    });
  });
});
