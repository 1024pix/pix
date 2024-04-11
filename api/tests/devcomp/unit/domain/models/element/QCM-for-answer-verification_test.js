import { QCMForAnswerVerification } from '../../../../../../src/devcomp/domain/models/element/QCM-for-answer-verification.js';
import { Feedbacks } from '../../../../../../src/devcomp/domain/models/Feedbacks.js';
import { QcmCorrectionResponse } from '../../../../../../src/devcomp/domain/models/QcmCorrectionResponse.js';
import { ValidatorQCM } from '../../../../../../src/devcomp/domain/models/validator/ValidatorQCM.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | QcmForAnswerVerification', function () {
  describe('#constructor', function () {
    it('should instanciate a QCM For Verification with right attributes', function () {
      // Given
      const proposal1 = Symbol('proposal1');
      const proposal2 = Symbol('proposal2');
      const feedbacks = { valid: 'valid', invalid: 'invalid' };
      const solutions = Symbol('solutions');
      const expectedSolution = { value: solutions };

      // When
      const qcm = new QCMForAnswerVerification({
        id: '123',
        instruction: 'instruction',
        locales: ['fr-FR'],
        proposals: [proposal1, proposal2],
        feedbacks,
        solutions,
      });

      // Then
      expect(qcm.id).equal('123');
      expect(qcm.instruction).equal('instruction');
      expect(qcm.locales).deep.equal(['fr-FR']);
      expect(qcm.proposals).deep.equal([proposal1, proposal2]);
      expect(qcm.solution).deep.equal(expectedSolution);
      expect(qcm.feedbacks).to.be.instanceof(Feedbacks);
      expect(qcm.type).to.be.equal('qcm');
      expect(qcm.validator).to.be.instanceof(ValidatorQCM);
    });

    describe('A QCM For Verification without a solution', function () {
      it('should throw an error', function () {
        expect(
          () =>
            new QCMForAnswerVerification({
              id: '123',
              instruction: 'toto',
              proposals: [Symbol('proposal1')],
            }),
        ).to.throw('The solutions are required for a QCM for verification');
      });
    });
  });

  describe('#assess', function () {
    it('should return a QcmCorrectionResponse for a valid answer', function () {
      // given
      const stubedIsOk = sinon.stub().returns(true);
      const assessResult = { result: { isOK: stubedIsOk } };
      const qcmSolution1 = Symbol('correctSolution1');
      const qcmSolution2 = Symbol('correctSolution2');
      const qcmSolutions = [qcmSolution1, qcmSolution2];
      const userResponse = [qcmSolution1, qcmSolution2];

      const validator = {
        assess: sinon.stub(),
      };
      const qcm = new QCMForAnswerVerification({
        id: 'qcm-id',
        instruction: '',
        proposals: [{ id: qcmSolution1 }, { id: qcmSolution2 }, { id: Symbol('proposal3') }],
        feedbacks: { valid: 'OK', invalid: 'KO' },
        solutions: qcmSolutions,
        validator,
      });
      qcm.userResponse = userResponse;

      validator.assess
        .withArgs({
          answer: {
            value: userResponse,
          },
        })
        .returns(assessResult);

      const expectedCorrection = {
        status: assessResult.result,
        feedback: qcm.feedbacks.valid,
        solution: qcmSolutions,
      };

      // when
      const correction = qcm.assess();

      // then
      expect(correction).to.deep.equal(expectedCorrection);
      expect(correction).to.deepEqualInstance(new QcmCorrectionResponse(expectedCorrection));
    });

    it('should return a QcmCorrectionResponse for a invalid answer', function () {
      // given
      const stubedIsOk = sinon.stub().returns(false);
      const assessResult = { result: { isOK: stubedIsOk } };
      const qcmSolution1 = Symbol('correctSolution1');
      const qcmSolution2 = Symbol('correctSolution2');
      const qcmSolutions = [qcmSolution1, qcmSolution2];
      const userResponse = ['wrongAnswer'];

      const validator = {
        assess: sinon.stub(),
      };
      const qcm = new QCMForAnswerVerification({
        id: 'qcm-id',
        instruction: '',
        proposals: [{ id: qcmSolution1 }, { id: qcmSolution2 }, { id: Symbol('proposal3') }],
        feedbacks: { valid: 'OK', invalid: 'KO' },
        solutions: qcmSolutions,
        validator,
      });
      qcm.userResponse = userResponse;

      validator.assess
        .withArgs({
          answer: {
            value: userResponse,
          },
        })
        .returns(assessResult);

      const expectedCorrection = {
        status: assessResult.result,
        feedback: qcm.feedbacks.invalid,
        solution: qcmSolutions,
      };

      // when
      const correction = qcm.assess();

      // then
      expect(correction).to.deep.equal(expectedCorrection);
      expect(correction).to.deepEqualInstance(new QcmCorrectionResponse(expectedCorrection));
    });
  });

  describe('#setUserResponse', function () {
    describe('if userResponse is valid', function () {
      it('should return the user response value', function () {
        // given
        const qcmSolution1 = '1';
        const qcmSolution2 = '2';
        const qcmSolutions = [qcmSolution1, qcmSolution2];
        const userResponse = [qcmSolution1, qcmSolution2];
        const expectedUserResponse = userResponse;

        const qcm = new QCMForAnswerVerification({
          id: 'qcm-id',
          instruction: '',
          proposals: [{}],
          feedbacks: { valid: 'OK', invalid: 'KO' },
          solutions: qcmSolutions,
        });

        // when
        qcm.setUserResponse(userResponse);

        // then
        expect(qcm.userResponse).to.deep.equal(expectedUserResponse);
      });
    });

    describe('if userResponse is not valid', function () {
      const cases = [
        {
          case: 'When the response number is not a string',
          userResponse: [1, 3],
        },
        {
          case: 'When the response is not a stringified number',
          userResponse: ['not a number', 'not a number'],
        },
        {
          case: 'When there are less than two response',
          userResponse: ['1'],
        },
        {
          case: 'When list of responses is empty',
          userResponse: [],
        },
        {
          case: 'When response is not an array',
          userResponse: {},
        },
        {
          case: 'When the list of responses is undefined',
          userResponse: undefined,
        },
      ];

      // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
      // eslint-disable-next-line mocha/no-setup-in-describe
      cases.forEach((testCase) => {
        it(`${testCase.case}, should throw error`, function () {
          // given
          const userResponse = testCase.userResponse;
          const qcmSolution1 = Symbol('correctSolution1');
          const qcmSolution2 = Symbol('correctSolution2');
          const qcmSolutions = [qcmSolution1, qcmSolution2];

          const qcm = new QCMForAnswerVerification({
            id: 'qcm-id',
            instruction: '',
            proposals: [{}],
            feedbacks: { valid: 'OK', invalid: 'KO' },
            solutions: qcmSolutions,
          });

          // when/then
          expect(() => qcm.setUserResponse(userResponse)).to.throw(EntityValidationError);
        });
      });
    });
  });
});
