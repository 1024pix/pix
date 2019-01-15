const { sinon, expect, hFake } = require('../../../test-helper');

const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const skillService = require('../../../../lib/domain/services/skills-service');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');

const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const certificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');

const usecases = require('../../../../lib/domain/usecases');

const { AssessmentEndedError } = require('../../../../lib/domain/errors');

const Assessment = require('../../../../lib/domain/models/Assessment');
const Skill = require('../../../../lib/cat/skill');

describe('Unit | Controller | assessment-controller-get-next-challenge', () => {

  describe('#getNextChallenge', () => {
    let assessmentWithoutScore;
    let assessmentWithScore;
    let scoredAsssessment;

    const assessmentSkills = {
      assessmentId: 1,
      validatedSkills: _generateValidatedSkills(),
      failedSkills: _generateFailedSkills(),
    };

    beforeEach(() => {

      assessmentWithoutScore = Assessment.fromAttributes({
        id: 1,
        courseId: 'recHzEA6lN4PEs7LG',
        userId: 5,
        type: 'DEMO',
      });

      assessmentWithScore = Assessment.fromAttributes({
        id: 1,
        courseId: 'recHzEA6lN4PEs7LG', userId: 5,
        estimatedLevel: 0,
        pixScore: 0,
      });

      scoredAsssessment = {
        assessmentPix: assessmentWithScore,
        skills: assessmentSkills,
      };

      sinon.stub(skillService, 'saveAssessmentSkills').resolves();
      sinon.stub(assessmentRepository, 'get');
      sinon.stub(assessmentRepository, 'save');
      sinon.stub(challengeRepository, 'get').resolves({});
      sinon.stub(certificationCourseRepository, 'changeCompletionDate').resolves();

      sinon.stub(usecases, 'getAssessment').resolves(scoredAsssessment);
      sinon.stub(usecases, 'getNextChallengeForCertification').resolves();
      sinon.stub(usecases, 'getNextChallengeForDemo').resolves();
      sinon.stub(usecases, 'getNextChallengeForSmartPlacement').resolves();
      sinon.stub(certificationChallengeRepository, 'getNonAnsweredChallengeByCourseId').resolves();
    });

    // TODO: Que faire si l'assessment n'existe pas pas ?

    describe('when the assessment is a preview', () => {

      const PREVIEW_ASSESSMENT_ID = 245;

      beforeEach(() => {
        assessmentRepository.get.resolves(Assessment.fromAttributes({
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
        const response = await assessmentController.getNextChallenge({ params: { id: PREVIEW_ASSESSMENT_ID } }, hFake);

        // then
        expect(response.source).to.deep.equal({ data: null });
      });
    });

    describe('when retrieving the next challenge is failing', () => {

      beforeEach(() => {
        assessmentRepository.get.resolves(assessmentWithoutScore);
      });

      it('should reply with 500 failing', async () => {
        // given
        const error = new Error();
        usecases.getNextChallengeForDemo.rejects(error);

        // when
        const response = await assessmentController.getNextChallenge({ params: { id: 7531 } }, hFake);

        // then
        expect(response.statusCode).to.equal(500);
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
          const response = await assessmentController.getNextChallenge({ params: { id: 7531 } }, hFake);

          // then
          expect(response.source).to.deep.equal({ data: null });
        });
      });
    });

    describe('when the assessment is not over yet', () => {

      beforeEach(() => {
        assessmentRepository.get.resolves(assessmentWithoutScore);
      });

      it('should not evaluate assessment score', async () => {
        // when
        await assessmentController.getNextChallenge({ params: { id: 7531 } }, hFake);

        // then
        expect(usecases.getAssessment).not.to.have.been.called;
      });

    });

    describe('when the assessment is a certification assessment', function() {

      const certificationAssessment = Assessment.fromAttributes({
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
        await assessmentController.getNextChallenge({ params: { id: 12 } }, hFake);

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
        const response = await assessmentController.getNextChallenge({ params: { id: 12 } }, hFake);

        // then
        expect(response.source).to.deep.equal({ data: null });
      });
    });

    describe('when the assessment is a smart placement assessment', () => {

      const assessment = Assessment.fromAttributes({
        id: 1,
        courseId: 'courseId',
        userId: 5,
        type: 'SMART_PLACEMENT',
      });

      beforeEach(() => {
        assessmentRepository.get.resolves(assessment);
      });

      it('should call the usecase getNextChallengeForSmartPlacement', async () => {
        // when
        await assessmentController.getNextChallenge({ params: { id: 1 } }, hFake);

        // then
        expect(usecases.getNextChallengeForSmartPlacement).to.have.been.calledWith({
          assessment,
        });
      });
    });
  });
});

function _generateValidatedSkills() {
  const url2 = new Skill('@url2');
  const web3 = new Skill('@web3');
  const skills = new Set();
  skills.add(url2);
  skills.add(web3);

  return skills;
}

function _generateFailedSkills() {
  const recherche2 = new Skill('@recherch2');
  const securite3 = new Skill('@securite3');
  const skill = new Set();
  skill.add(recherche2);
  skill.add(securite3);

  return skill;
}

