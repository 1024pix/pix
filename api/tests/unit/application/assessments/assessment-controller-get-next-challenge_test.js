const { describe, it, beforeEach, afterEach, sinon, expect } = require('../../../test-helper');
const Boom = require('boom');

const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const assessmentService = require('../../../../lib/domain/services/assessment-service');
const skillService = require('../../../../lib/domain/services/skills-service');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');

const { NotFoundError } = require('../../../../lib/domain/errors');

const Assessment = require('../../../../lib/domain/models/data/assessment');
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
      sandbox.stub(assessmentWithScore, 'save').resolves();
      sandbox.stub(skillService, 'saveAssessmentSkills').resolves();
      sandbox.stub(assessmentService, 'getAssessmentNextChallengeId');
      sandbox.stub(assessmentRepository, 'get');
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('when the assessment is a preview', () => {

      const PREVIEW_ASSESSMENT_ID = 245;

      beforeEach(() => {
        assessmentRepository.get.resolves(new Assessment({
          id: 1,
          courseId: 'null2356871',
          userId: 5,
          estimatedLevel: 0,
          pixScore: 0,
        }));
      });

      it('should return a 204 code directly', () => {
        // When
        const promise = assessmentController.getNextChallenge({ params: { id: PREVIEW_ASSESSMENT_ID } }, replyStub);

        // Then
        return promise.then(() => {
          expect(replyStub).to.have.been.calledOnce;
          expect(codeStub).to.have.been.calledWith(204);
        });
      });
    });

    describe('when the assessment is over', () => {

      beforeEach(() => {
        assessmentService.getAssessmentNextChallengeId.resolves(null);
        assessmentRepository.get.resolves(assessmentWithoutScore);
      });

      it('should call fetchAssessment', () => {
        // When
        const promise = assessmentController.getNextChallenge({ params: { id: 7531 } }, replyStub);

        // Then
        return promise.then(() => {
          expect(assessmentService.fetchAssessment).to.have.been.calledWith(7531);
        });
      });

      it('should save the assessment with score', () => {
        // When
        const promise = assessmentController.getNextChallenge({ params: { id: 7531 } }, replyStub);

        // Then
        return promise.then(() => {
          expect(assessmentWithScore.save).to.have.been.called;
        });
      });

      it('should save the skills', () => {
        // When
        assessmentWithScore.save.resolves();
        skillService.saveAssessmentSkills.resolves({});
        const promise = assessmentController.getNextChallenge({ params: { id: 7531 } }, replyStub);

        // Then
        return promise.then(() => {
          expect(skillService.saveAssessmentSkills).to.have.been.calledOnce;
          expect(skillService.saveAssessmentSkills).to.have.been.calledWith(assessmentSkills);
        });
      });

      it('should reply with no content', () => {
        // Given
        assessmentWithScore.save.resolves();
        skillService.saveAssessmentSkills.resolves({});

        // When
        const promise = assessmentController.getNextChallenge({ params: { id: 7531 } }, replyStub);

        // Then
        return promise.then(() => {
          expect(replyStub).to.have.been.calledOnce;
          expect(replyStub.getCalls()[0].args).to.deep.equal([]);
        });
      });

      describe('when saving level and score is failing', () => {

        let badImplementationSpy;
        let replyStub;

        beforeEach(() => {
          badImplementationSpy = sinon.stub(Boom, 'badImplementation').returns({});
          replyStub = sinon.stub();
        });

        afterEach(() => {
          badImplementationSpy.restore();
        });

        it('should return a badImplementation error when evaluating is an error', () => {
          // Given
          const error = new Error('Unable to evaluate level');
          assessmentService.fetchAssessment.rejects(error);

          // When
          const promise = assessmentController.getNextChallenge({ params: { id: 7531 } }, replyStub);

          // Then
          return promise.then(() => {
            expect(badImplementationSpy).to.have.been.calledWith(error);
            expect(replyStub).to.have.been.calledWith(Boom.badImplementation(error));
          });
        });

        it('should return an error when database returns an error', () => {
          // Given
          const error = new Error('Unable to save assessment');
          assessmentWithScore.save.rejects(error);

          // When
          const promise = assessmentController.getNextChallenge({ params: { id: 7531 } }, replyStub);

          // Then
          return promise.then(() => {
            expect(badImplementationSpy).to.have.been.calledWith(error);
            expect(replyStub).to.have.been.calledWith(Boom.badImplementation(error));
          });

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
        sandbox.stub(assessmentService, 'getNextChallengeForCertificationCourse');
        sandbox.stub(assessmentService, 'isCertificationAssessment').returns(true);
        sandbox.stub(Boom, 'notFound').returns({ message: 'NotFoundError' });
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
        assessmentService.getNextChallengeForCertificationCourse.rejects(new NotFoundError());

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
        sandbox.stub(challengeRepository, 'get').resolves(false);

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

