const { sinon, expect } = require('../../../test-helper');
const Boom = require('boom');

const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const assessmentService = require('../../../../lib/domain/services/assessment-service');
const skillService = require('../../../../lib/domain/services/skills-service');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');

const { AssessmentEndedError } = require('../../../../lib/domain/errors');

const Assessment = require('../../../../lib/domain/models/Assessment');
const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');
const Skill = require('../../../../lib/cat/skill');

describe('Unit | Controller | assessment-controller-get-next-challenge', () => {

  describe('#getNextChallenge', () => {

    let replyStub;
    let codeStub;
    let sandbox;
    let assessmentWithoutScore;
    let assessmentWithScore;
    let scoredAsssessment;

    const assessmentSkills = {
      assessmentId: 1,
      validatedSkills: _generateValitedSkills(),
      failedSkills: _generateFailedSkills()
    };

    beforeEach(() => {

      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({ code: codeStub });

      assessmentWithoutScore = new Assessment({
        id: 1,
        courseId: 'recHzEA6lN4PEs7LG',
        userId: 5
      });

      assessmentWithScore = new Assessment({
        id: 1,
        courseId: 'recHzEA6lN4PEs7LG', userId: 5,
        estimatedLevel: 0,
        pixScore: 0,
      });

      scoredAsssessment = {
        assessmentPix: assessmentWithScore,
        skills: assessmentSkills
      };

      sandbox = sinon.sandbox.create();

      sandbox.stub(assessmentService, 'fetchAssessment').resolves(scoredAsssessment);
      sandbox.stub(skillService, 'saveAssessmentSkills').resolves();
      sandbox.stub(assessmentService, 'getAssessmentNextChallengeId');
      sandbox.stub(assessmentService, 'getNextChallengeForCertificationCourse');
      sandbox.stub(assessmentRepository, 'get');
      sandbox.stub(assessmentRepository, 'save');
      sandbox.stub(Boom, 'notFound').returns({ message: 'NotFoundError' });
      sandbox.stub(Boom, 'badImplementation').returns({ message: 'BadImplementation' });
      sandbox.stub(challengeRepository, 'get').resolves({});
      sandbox.stub(certificationCourseRepository, 'updateStatus').resolves();
    });

    afterEach(() => {
      sandbox.restore();
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
          type: 'PREVIEW'
        }));

        assessmentService.getAssessmentNextChallengeId.rejects(new AssessmentEndedError());
      });

      it('should return a 404 code directly', () => {
        // When
        const promise = assessmentController.getNextChallenge({ params: { id: PREVIEW_ASSESSMENT_ID } }, replyStub);

        // Then
        return promise.then(() => {
          expect(replyStub).to.have.been.calledOnce;
          expect(replyStub).to.have.been.calledWith({ message: 'NotFoundError' });
          expect(Boom.notFound).to.have.been.calledOnce;
        });
      });
    });

    describe('when retrieving the next challenge is failing', () => {

      beforeEach(() => {
        assessmentRepository.get.resolves(assessmentWithoutScore);
      });

      it('should call fetchAssessment', () => {
        // given
        const error = new Error();
        assessmentService.getAssessmentNextChallengeId.rejects(error);

        // When
        const promise = assessmentController.getNextChallenge({ params: { id: 7531 } }, replyStub);

        // Then
        return promise.then(() => {
          expect(Boom.badImplementation).to.have.been.calledWith(error);
          expect(replyStub).to.have.been.calledWith(Boom.badImplementation(error));
        });
      });

    });

    describe('when the assessment is over', () => {

      beforeEach(() => {
        assessmentService.getAssessmentNextChallengeId.rejects(new AssessmentEndedError());
        assessmentService.getNextChallengeForCertificationCourse.rejects(new AssessmentEndedError());
        assessmentRepository.get.resolves(assessmentWithoutScore);
        assessmentService.fetchAssessment.resolves(scoredAsssessment);
      });

      context('when the assessment is a not certification', () => {

        it('should not update the certification course status', () => {
          // given
          const certificationAssessment = new Assessment({
            id: 7531,
            courseId: '356',
            userId: 5,
            type: 'PLACEMENT'
          });
          assessmentRepository.get.resolves(certificationAssessment);
          assessmentService.fetchAssessment.resolves({ assessmentPix: certificationAssessment });

          // when
          const promise = assessmentController.getNextChallenge({ params: { id: 7531 } }, replyStub);

          // then
          return promise.then(() => {
            expect(certificationCourseRepository.updateStatus).to.not.have.been.called;
          });
        });
      });

      it('should reply with no content', () => {
        // Given
        skillService.saveAssessmentSkills.resolves({});

        // When
        const promise = assessmentController.getNextChallenge({ params: { id: 7531 } }, replyStub);

        // Then
        return promise.then(() => {
          expect(replyStub).to.have.been.calledOnce;
          expect(replyStub).to.have.been.calledWith({ message: 'NotFoundError' });
          expect(Boom.notFound).to.have.been.calledOnce;
        });
      });
    });

    describe('when the assessment is not over yet', () => {

      beforeEach(() => {
        assessmentService.getAssessmentNextChallengeId.resolves({});
        assessmentRepository.get.resolves(assessmentWithoutScore);
      });

      it('should not evaluate assessment score', () => {
        // When
        const promise = assessmentController.getNextChallenge({ params: { id: 7531 } }, replyStub);

        // Then
        return promise.then(() => {
          expect(assessmentService.fetchAssessment).not.to.have.been.called;
        });
      });

    });

    describe('when the assessment is a certification assessment', function() {

      const certificationAssessment = new Assessment({
        id: 'assessmentId',
        type: 'CERTIFICATION'
      });

      beforeEach(() => {
        assessmentRepository.get.resolves(certificationAssessment);
      });

      it('should call getNextChallengeForCertificationCourse in assessmentService', function() {
        // given
        assessmentService.getNextChallengeForCertificationCourse.resolves();

        // when
        const promise = assessmentController.getNextChallenge({ params: { id: 12 } }, replyStub);

        // then
        return promise.then(() => {
          expect(assessmentService.getNextChallengeForCertificationCourse).to.have.been.calledOnce;
          expect(assessmentService.getNextChallengeForCertificationCourse).to.have.been.calledWith(certificationAssessment);
        });
      });

      it('should reply 404 when unable to find the next challenge', () => {
        // given
        assessmentService.getNextChallengeForCertificationCourse.rejects(new AssessmentEndedError());

        // when
        const promise = assessmentController.getNextChallenge({ params: { id: 12 } }, replyStub);

        // then
        return promise.then(() => {
          expect(replyStub).to.have.been.calledOnce
            .and.to.have.been.calledWith(Boom.notFound());
        });
      });

      it('should provide the correct challengeId to the next layer', function() {
        // given
        const challenge = new CertificationChallenge({ challengeId: 'idea' });
        assessmentService.getNextChallengeForCertificationCourse.resolves(challenge);

        // when
        const promise = assessmentController.getNextChallenge({ params: { id: 12 } }, replyStub);

        // then
        return promise.then(() => {
          expect(challengeRepository.get).to.have.been.calledWith(challenge.challengeId);
        });
      });
    });

  });

});

function _generateValitedSkills() {
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

