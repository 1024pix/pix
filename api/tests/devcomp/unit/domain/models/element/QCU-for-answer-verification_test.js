import { expect, sinon } from '../../../../../test-helper.js';
import { QCUForAnswerVerification } from '../../../../../../src/devcomp/domain/models/element/QCU-for-answer-verification.js';
import { ElementAnswer } from '../../../../../../src/devcomp/domain/models/ElementAnswer.js';
import { QcuCorrectionResponse } from '../../../../../../src/devcomp/domain/models/QcuCorrectionResponse.js';
import { Feedbacks } from '../../../../../../src/devcomp/domain/models/Feedbacks.js';

describe('Unit | Devcomp | Domain | Models | Element | QcuForAnswerVerification', function () {
  describe('#constructor', function () {
    it('should instanciate a QCU For Verification with right attributes', function () {
      // Given
      const proposal1 = Symbol('proposal1');
      const proposal2 = Symbol('proposal2');
      const feedbacks = { valid: 'valid', invalid: 'invalid' };
      const solution = Symbol('solution');

      // When
      const qcu = new QCUForAnswerVerification({
        id: '123',
        instruction: 'instruction',
        locales: ['fr-FR'],
        proposals: [proposal1, proposal2],
        feedbacks,
        solution,
      });

      // Then
      expect(qcu.id).equal('123');
      expect(qcu.instruction).equal('instruction');
      expect(qcu.locales).deep.equal(['fr-FR']);
      expect(qcu.proposals).deep.equal([proposal1, proposal2]);
      expect(qcu.solution).deep.equal(solution);
      expect(qcu.feedbacks).to.be.instanceof(Feedbacks);
    });

    describe('A QCU For Verification without a solution', function () {
      it('should throw an error', function () {
        expect(
          () =>
            new QCUForAnswerVerification({
              id: '123',
              instruction: 'toto',
              proposals: [Symbol('proposal1')],
            }),
        ).to.throw('La solution est obligatoire pour un QCU de vérification');
      });
    });
  });

  describe('#assess', function () {
    it('should return a QcuCorrectionResponse for a valid answer', function () {
      // given
      const stubedIsOk = sinon.stub().returns(true);
      const assessResult = { result: { isOK: stubedIsOk } };
      const qcuSolution = Symbol('correctSolution');
      const userResponse = [qcuSolution];

      const validator = {
        assess: sinon.stub(),
      };
      validator.assess
        .withArgs({
          answer: {
            value: userResponse[0],
          },
        })
        .returns(assessResult);
      const qcu = new QCUForAnswerVerification({
        id: 'qcu-id',
        instruction: '',
        proposals: [{ id: qcuSolution }],
        feedbacks: { valid: 'OK', invalid: 'KO' },
        solution: qcuSolution,
        validator,
      });

      const expectedResult = {
        elementId: 'qcu-id',
        userResponseValue: userResponse[0],
        correction: {
          status: assessResult.result,
          feedback: qcu.feedbacks.valid,
          solution: qcuSolution,
        },
      };

      // when
      const result = qcu.assess(userResponse);

      // then
      expect(result).to.deep.equal(expectedResult);
      expect(result).to.be.instanceOf(ElementAnswer);
      expect(result.correction).to.be.instanceOf(QcuCorrectionResponse);
    });

    it('should return a QcuCorrectionResponse for a invalid answer', function () {
      // given
      const stubedIsOk = sinon.stub().returns(false);
      const assessResult = { result: { isOK: stubedIsOk } };
      const qcuSolution = Symbol('correctSolution');
      const userResponse = ['wrongAnswer'];

      const validator = {
        assess: sinon.stub(),
      };
      validator.assess
        .withArgs({
          answer: {
            value: userResponse[0],
          },
        })
        .returns(assessResult);
      const qcu = new QCUForAnswerVerification({
        id: 'qcu-id',
        instruction: '',
        proposals: [{ id: qcuSolution }],
        feedbacks: { valid: 'OK', invalid: 'KO' },
        solution: qcuSolution,
        validator,
      });

      const expectedResult = {
        elementId: 'qcu-id',
        userResponseValue: userResponse[0],
        correction: {
          status: assessResult.result,
          feedback: qcu.feedbacks.invalid,
          solution: qcuSolution,
        },
      };

      // when
      const result = qcu.assess(userResponse);

      // then
      expect(result).to.deep.equal(expectedResult);
      expect(result).to.be.instanceOf(ElementAnswer);
      expect(result.correction).to.be.instanceOf(QcuCorrectionResponse);
    });
  });
});
