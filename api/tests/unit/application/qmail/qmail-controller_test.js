const { expect, sinon, hFake } = require('../../../test-helper');
const AnswerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const solutionRepository = require('../../../../lib/infrastructure/repositories/solution-repository');
const Answer = require('../../../../lib/infrastructure/data/answer');
const QmailController = require('../../../../lib/application/qmail/qmail-controller');
const QmailValidationService = require('../../../../lib/domain/services/qmail-validation-service');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Controller | qmailController', () => {

  describe('#validate', () => {
    let answer;
    const challengeId = 'recLt9uwaETr3I24pi';
    const assessmentId = '35672';

    const emailSample = {
      mail: {
        to: {
          value: [],
          html: `<span class="mp_address_group"><a href="mailto:${challengeId}-${assessmentId}-0609@pix.fr" class="mp_address_email">${challengeId}-${assessmentId}-0609@pix.fr</a></span>`,
          text: `${challengeId}-${assessmentId}-0609@pix.fr`
        }
      },
      headers: {
        to: {
          value: [],
          html: `<span class="mp_address_group"><a href="mailto:${challengeId}-${assessmentId}-0609@pix.fr" class="mp_address_email">${challengeId}-${assessmentId}-0609@pix.fr</a></span>`,
          text: `${challengeId}-${assessmentId}-0609@pix.fr`
        }
      }
    };

    let sandbox;
    const challengeToEvaluate = { type: 'QMAIL', value: '--- TOTO' };

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      answer = new Answer({ result: '#PENDING#' });
      sinon.stub(answer, 'save').resolves();

      sandbox.stub(AnswerRepository, 'findByChallengeAndAssessment').resolves(answer);
      sandbox.stub(solutionRepository, 'getByChallengeId').resolves(challengeToEvaluate);
      sandbox.stub(QmailValidationService, 'validateEmail').returns(true);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should fetch the validation rules', async () => {
      // when
      await QmailController.validate({ payload: emailSample }, hFake);

      // then
      sinon.assert.calledOnce(solutionRepository.getByChallengeId);
      sinon.assert.calledWith(solutionRepository.getByChallengeId, challengeId);
    });

    context('when the challenge does not exist', () => {

      const notFoundError = new NotFoundError('Damn, an error');

      beforeEach(() => {
        solutionRepository.getByChallengeId.rejects(notFoundError);
      });

      it('should return a Bad Request', () => {
        // when
        const promise = QmailController.validate({ payload: emailSample }, hFake);

        // then
        return expect(promise).to.be.rejected
          .and.eventually.to.nested.include({
            message: `Le challenge ${challengeId} n'existe pas.`,
            'output.statusCode': 400
          });
      });
    });

    context('when the challenge is found', () => {
      context('but the challenge is not the QMAIL kind', () => {

        beforeEach(() => {
          solutionRepository.getByChallengeId.resolves({ type: 'QCU' });
        });

        it('should return a Bad Request', () => {
          // when
          const promise = QmailController.validate({ payload: emailSample }, hFake);

          // then
          return expect(promise).to.be.rejected
            .and.eventually.to.nested.include({
              message: `Le challenge ${challengeId} n'est pas elligible à une validation QMAIL`,
              'output.statusCode': 400
            });
        });
      });

      it('should load the answer', async () => {
        // when
        await QmailController.validate({
          payload: emailSample
        }, hFake);

        // then
        sinon.assert.calledOnce(AnswerRepository.findByChallengeAndAssessment);
        sinon.assert.calledWith(AnswerRepository.findByChallengeAndAssessment, challengeId, assessmentId);
      });

      context('when analysing the email', () => {

        it('should change answer result when the email is validated', async () => {
          // when
          await QmailController.validate({ payload: emailSample }, hFake);

          // then
          sinon.assert.calledOnce(answer.save);
          expect(answer.get('result')).to.equal('ok');
        });

        it('should invalid the answer when the given email is wrong', async () => {
          // given
          QmailValidationService.validateEmail.returns(false);

          // when
          await QmailController.validate({ payload: emailSample }, hFake);

          // then
          sinon.assert.calledOnce(answer.save);
          expect(answer.get('result')).to.equal('ko');
        });

        it('should save the answer once the email has been checked', async () => {
          // when
          await QmailController.validate({ payload: emailSample }, hFake);

          // then
          sinon.assert.calledOnce(QmailValidationService.validateEmail);
          sinon.assert.callOrder(
            solutionRepository.getByChallengeId,
            AnswerRepository.findByChallengeAndAssessment,
            QmailValidationService.validateEmail,
            answer.save
          );
          sinon.assert.calledWith(QmailValidationService.validateEmail, emailSample, challengeToEvaluate.value);
        });
      });

      it('should reply OK after validating the answer', async () => {
        // when
        await QmailController.validate({ payload: emailSample }, hFake);

        // then
        sinon.assert.callOrder(
          AnswerRepository.findByChallengeAndAssessment,
          answer.save,
        );
      });
    });

    context('when analysing goes wrong', () => {

      it('should return INTERNAL_ERROR when finding the answer is failing', () => {
        // given
        const error = new Error();
        AnswerRepository.findByChallengeAndAssessment.rejects(error);

        // when
        const promise = QmailController.validate({ payload: emailSample }, hFake);

        // then
        return expect(promise).to.be.rejected
          .and.eventually.to.have.nested.property('output.statusCode', 500);
      });

      it('should return INTERNAL_ERROR when saving is failing', () => {
        // given
        const error = new Error();
        answer.save.rejects(error);

        // when
        const promise = QmailController.validate({ payload: emailSample }, hFake);

        // then
        return expect(promise).to.be.rejected
          .and.eventually.to.have.nested.property('output.statusCode', 500);
      });
    });
  });
});
