const { expect, sinon } = require('../../../test-helper');
const AnswerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const SolutionRepository = require('../../../../lib/infrastructure/repositories/solution-repository');
const Answer = require('../../../../lib/infrastructure/data/answer');
const QmailController = require('../../../../lib/application/qmail/qmail-controller');
const QmailValidationService = require('../../../../lib/domain/services/qmail-validation-service');
const Boom = require('boom');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Controller | qmailController', () => {

  describe('#validate', () => {

    let answer;
    let replyStub;
    let codeStub;
    const challengeId = 'recLt9uwaETr3I24pi';
    const assessmentId = '35672';

    const emailSample = {
      mail: {
        to: {
          value: [],
          html: `<span class="mp_address_group"><a href="mailto:${challengeId}-${assessmentId}-0609@pix.beta.gouv.fr" class="mp_address_email">${challengeId}-${assessmentId}-0609@pix.beta.gouv.fr</a></span>`,
          text: `${challengeId}-${assessmentId}-0609@pix.beta.gouv.fr`
        }
      },
      headers: {
        to: {
          value: [],
          html: `<span class="mp_address_group"><a href="mailto:${challengeId}-${assessmentId}-0609@pix.beta.gouv.fr" class="mp_address_email">${challengeId}-${assessmentId}-0609@pix.beta.gouv.fr</a></span>`,
          text: `${challengeId}-${assessmentId}-0609@pix.beta.gouv.fr`
        }
      }
    };

    let sandbox;
    const challengeToEvaluate = { type: 'QMAIL', value: '--- TOTO' };

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({
        code: codeStub
      });

      answer = new Answer({ result: '#PENDING#' });
      sinon.stub(answer, 'save').resolves();

      sandbox.stub(AnswerRepository, 'findByChallengeAndAssessment').resolves(answer);
      sandbox.stub(SolutionRepository, 'get').resolves(challengeToEvaluate);
      sandbox.stub(QmailValidationService, 'validateEmail').returns(true);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should fetch the validation rules', () => {
      // when
      const promise = QmailController.validate({ payload: emailSample }, replyStub);

      return promise.then(() => {
        sinon.assert.calledOnce(SolutionRepository.get);
        sinon.assert.calledWith(SolutionRepository.get, challengeId);
      });
    });

    context('when the challenge does not exists', () => {

      let boomBadRequestStub;
      const boomError = {};
      const notFoundError = new NotFoundError('Damn, an error');

      beforeEach(() => {
        SolutionRepository.get.rejects(notFoundError);
        boomBadRequestStub = sinon.stub(Boom, 'badRequest').returns(boomError);
      });

      afterEach(() => {
        boomBadRequestStub.restore();
      });

      it('should return a Bad Request', () => {
        // when
        const promise = QmailController.validate({ payload: emailSample }, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(boomBadRequestStub, `Le challenge ${challengeId} n'existe pas.`);
          sinon.assert.calledOnce(replyStub);
          sinon.assert.calledWith(replyStub, boomError);
        });
      });
    });

    context('when the challenge is found', () => {
      context('but the challenge is not the QMAIL kind', () => {

        let boomBadRequestStub;
        const boomError = {};

        beforeEach(() => {
          SolutionRepository.get.resolves({ type: 'QCU' });
          boomBadRequestStub = sinon.stub(Boom, 'badRequest').returns(boomError);
        });

        afterEach(() => {
          boomBadRequestStub.restore();
        });

        it('should return a Bad Request', () => {
          // when
          const promise = QmailController.validate({ payload: emailSample }, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(boomBadRequestStub, `Le challenge ${challengeId} n'est pas elligible à une validation QMAIL`);
            sinon.assert.calledOnce(replyStub);
            sinon.assert.calledWith(replyStub, boomError);
          });
        });
      });

      it('should load the answer', () => {
        // when
        const promise = QmailController.validate({
          payload: emailSample
        }, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(AnswerRepository.findByChallengeAndAssessment);
          sinon.assert.calledWith(AnswerRepository.findByChallengeAndAssessment, challengeId, assessmentId);
        });
      });

      context('when analysing the email', () => {

        it('should change answer result when the email is validated', () => {
          // when
          const promise = QmailController.validate({ payload: emailSample }, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(answer.save);
            expect(answer.get('result')).to.equal('ok');
          });
        });

        it('should invalid the answer when the given email is wrong', () => {
          // given
          QmailValidationService.validateEmail.returns(false);

          // when
          const promise = QmailController.validate({ payload: emailSample }, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(answer.save);
            expect(answer.get('result')).to.equal('ko');
          });
        });

        it('should save the answer once the email has been checked', () => {
          // when
          const promise = QmailController.validate({ payload: emailSample }, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(QmailValidationService.validateEmail);
            sinon.assert.callOrder(
              SolutionRepository.get,
              AnswerRepository.findByChallengeAndAssessment,
              QmailValidationService.validateEmail,
              answer.save
            );
            sinon.assert.calledWith(QmailValidationService.validateEmail, emailSample, challengeToEvaluate.value);
          });
        });
      });

      it('should reply OK after validating the answer', () => {
        // when
        const promise = QmailController.validate({ payload: emailSample }, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.callOrder(
            AnswerRepository.findByChallengeAndAssessment,
            answer.save,
            replyStub
          );
        });
      });
    });

    context('when analysing goes wrong', () => {

      let boomBadImplementationStub;
      const jsonAPIError = { error: 'Expected API Return ' };

      beforeEach(() => {
        boomBadImplementationStub = sinon.stub(Boom, 'badImplementation').returns(jsonAPIError);
      });

      afterEach(() => {
        boomBadImplementationStub.restore();
      });

      it('should return INTERNAL_ERROR when finding the answer is failing', () => {
        // given
        const error = new Error();
        AnswerRepository.findByChallengeAndAssessment.rejects(error);

        // when
        const promise = QmailController.validate({ payload: emailSample }, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(boomBadImplementationStub);
          sinon.assert.calledWith(boomBadImplementationStub, error);
          sinon.assert.calledOnce(replyStub);
          sinon.assert.calledWith(replyStub, jsonAPIError);
        });
      });

      it('should return INTERNAL_ERROR when saving is failing', () => {
        // given
        const error = new Error();
        answer.save.rejects(error);

        // when
        const promise = QmailController.validate({ payload: emailSample }, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(boomBadImplementationStub);
          sinon.assert.calledWith(boomBadImplementationStub, error);
          sinon.assert.calledOnce(replyStub);
          sinon.assert.calledWith(replyStub, jsonAPIError);
        });
      });
    });
  });
});
