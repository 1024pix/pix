import { ModuleInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { QCUForAnswerVerification } from '../../../../../../src/devcomp/domain/models/element/QCU-for-answer-verification.js';
import { Feedbacks } from '../../../../../../src/devcomp/domain/models/Feedbacks.js';
import { QcuCorrectionResponse } from '../../../../../../src/devcomp/domain/models/QcuCorrectionResponse.js';
import { DomainError, EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | QcuForAnswerVerification', function () {
  describe('#constructor', function () {
    it('should instanciate a QCU For Verification with right attributes', function () {
      // Given
      const proposal1 = { id: Symbol('proposal1') };
      const proposal2 = { id: Symbol('proposal2') };
      const feedbacks = { valid: 'valid', invalid: 'invalid' };
      const solution = proposal1.id;
      const expectedSolution = { value: solution };

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
      expect(qcu.solution).deep.equal(expectedSolution);
      expect(qcu.feedbacks).to.be.instanceof(Feedbacks);
    });

    describe('A QCU For Verification without a solution', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(
          () => new QCUForAnswerVerification({ id: '123', instruction: 'toto', proposals: [Symbol('proposal1')] }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The solution is required for a verification QCU');
      });
    });

    describe('A QCU For Verification with an unexisting solution', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(
          () =>
            new QCUForAnswerVerification({
              id: '123',
              instruction: 'toto',
              proposals: [Symbol('proposal1')],
              solution: Symbol('unexistingProposalId'),
            }),
        )();

        // then
        expect(error).to.be.instanceOf(ModuleInstantiationError);
        expect(error.message).to.equal('The QCU solution id is not an existing proposal id');
      });
    });
  });

  describe('#assess', function () {
    describe('when we have only global feedback for proposals', function () {
      it('should return a QcuCorrectionResponse for a valid answer', function () {
        // given
        const stubedIsOk = sinon.stub().returns(true);
        const assessResult = { result: { isOK: stubedIsOk } };
        const qcuSolution = Symbol('correctSolution');
        const userResponse = qcuSolution;

        const validator = {
          assess: sinon.stub(),
        };
        const qcu = new QCUForAnswerVerification({
          id: 'qcu-id',
          instruction: '',
          proposals: [{ id: qcuSolution }],
          feedbacks: { valid: 'OK', invalid: 'KO' },
          solution: qcuSolution,
          validator,
        });
        qcu.userResponse = userResponse;

        validator.assess
          .withArgs({
            answer: {
              value: userResponse,
            },
          })
          .returns(assessResult);

        const expectedCorrection = {
          status: assessResult.result,
          feedback: qcu.feedbacks.valid,
          solution: qcuSolution,
        };

        // when
        const correction = qcu.assess();

        // then
        expect(correction).to.deepEqualInstance(new QcuCorrectionResponse(expectedCorrection));
      });

      it('should return a QcuCorrectionResponse for a invalid answer', function () {
        // given
        const stubedIsOk = sinon.stub().returns(false);
        const assessResult = { result: { isOK: stubedIsOk } };
        const qcuSolution = Symbol('correctSolution');
        const userResponse = 'wrongAnswer';

        const validator = {
          assess: sinon.stub(),
        };
        const qcu = new QCUForAnswerVerification({
          id: 'qcu-id',
          instruction: '',
          proposals: [{ id: qcuSolution }],
          feedbacks: { valid: 'OK', invalid: 'KO' },
          solution: qcuSolution,
          validator,
        });
        qcu.userResponse = userResponse;

        validator.assess
          .withArgs({
            answer: {
              value: userResponse,
            },
          })
          .returns(assessResult);

        const expectedCorrection = {
          status: assessResult.result,
          feedback: qcu.feedbacks.invalid,
          solution: qcuSolution,
        };

        // when
        const correction = qcu.assess();

        // then
        expect(correction).to.deepEqualInstance(new QcuCorrectionResponse(expectedCorrection));
      });
    });

    describe('when there are specific feedbacks for proposals', function () {
      it('should return a QcuCorrectionResponse for a valid answer', function () {
        // given
        const stubedIsOk = sinon.stub().returns(true);
        const assessResult = { result: { isOK: stubedIsOk } };
        const qcuSolution = Symbol('correctSolution');
        const userResponse = qcuSolution;

        const validator = {
          assess: sinon.stub(),
        };
        const qcu = new QCUForAnswerVerification({
          id: 'qcu-id',
          instruction: '',
          proposals: [
            {
              id: qcuSolution,
              feedback: 'Answer 1 is correct',
            },
            {
              id: 'wrongSolution',
              feedback: 'Answer 2 is wrong',
            },
          ],
          solution: qcuSolution,
          validator,
        });
        qcu.userResponse = userResponse;

        validator.assess
          .withArgs({
            answer: {
              value: userResponse,
            },
          })
          .returns(assessResult);

        const expectedCorrection = {
          status: assessResult.result,
          feedback: qcu.proposals[0].feedback,
          solution: qcuSolution,
        };

        // when
        const correction = qcu.assess();

        // then
        expect(correction).to.deepEqualInstance(new QcuCorrectionResponse(expectedCorrection));
      });

      it('should return a QcuCorrectionResponse for a invalid answer', function () {
        // given
        const stubedIsOk = sinon.stub().returns(false);
        const assessResult = { result: { isOK: stubedIsOk } };
        const qcuSolution = Symbol('correctSolution');
        const userResponse = 'wrongAnswer';

        const validator = {
          assess: sinon.stub(),
        };
        const qcu = new QCUForAnswerVerification({
          id: 'qcu-id',
          instruction: '',
          proposals: [
            {
              id: qcuSolution,
              feedback: 'Answer 1 is correct',
            },
            {
              id: 'wrongAnswer',
              feedback: 'Answer 2 is wrong',
            },
          ],
          solution: qcuSolution,
          validator,
        });
        qcu.userResponse = userResponse;

        validator.assess
          .withArgs({
            answer: {
              value: userResponse,
            },
          })
          .returns(assessResult);

        const expectedCorrection = {
          status: assessResult.result,
          feedback: qcu.proposals[1].feedback,
          solution: qcuSolution,
        };

        // when
        const correction = qcu.assess();

        // then
        expect(correction).to.deepEqualInstance(new QcuCorrectionResponse(expectedCorrection));
      });
    });

    describe('when there are both specific feedbacks and global feedbacks for proposals', function () {
      it('should return a QcuCorrectionResponse for a valid answer', function () {
        // given
        const stubedIsOk = sinon.stub().returns(true);
        const assessResult = { result: { isOK: stubedIsOk } };
        const qcuSolution = Symbol('correctSolution');
        const userResponse = qcuSolution;

        const validator = {
          assess: sinon.stub(),
        };
        const qcu = new QCUForAnswerVerification({
          id: 'qcu-id',
          instruction: '',
          proposals: [
            {
              id: qcuSolution,
              feedback: 'Answer 1 is correct',
            },
            {
              id: 'wrongSolution',
              feedback: 'Answer 2 is wrong',
            },
          ],
          feedbacks: { valid: 'OK', invalid: 'KO' },
          solution: qcuSolution,
          validator,
        });
        qcu.userResponse = userResponse;

        validator.assess
          .withArgs({
            answer: {
              value: userResponse,
            },
          })
          .returns(assessResult);

        const expectedCorrection = {
          status: assessResult.result,
          feedback: qcu.proposals[0].feedback,
          solution: qcuSolution,
        };

        // when
        const correction = qcu.assess();

        // then
        expect(correction).to.deepEqualInstance(new QcuCorrectionResponse(expectedCorrection));
      });

      it('should return a QcuCorrectionResponse for a invalid answer', function () {
        // given
        const stubedIsOk = sinon.stub().returns(false);
        const assessResult = { result: { isOK: stubedIsOk } };
        const qcuSolution = Symbol('correctSolution');
        const userResponse = 'wrongAnswer';

        const validator = {
          assess: sinon.stub(),
        };
        const qcu = new QCUForAnswerVerification({
          id: 'qcu-id',
          instruction: '',
          proposals: [
            {
              id: qcuSolution,
              feedback: 'Answer 1 is correct',
            },
            {
              id: 'wrongAnswer',
              feedback: 'Answer 2 is wrong',
            },
          ],
          feedbacks: { valid: 'OK', invalid: 'KO' },
          solution: qcuSolution,
          validator,
        });
        qcu.userResponse = userResponse;

        validator.assess
          .withArgs({
            answer: {
              value: userResponse,
            },
          })
          .returns(assessResult);

        const expectedCorrection = {
          status: assessResult.result,
          feedback: qcu.proposals[1].feedback,
          solution: qcuSolution,
        };

        // when
        const correction = qcu.assess();

        // then
        expect(correction).to.deepEqualInstance(new QcuCorrectionResponse(expectedCorrection));
      });
    });
  });

  describe('#setUserResponse', function () {
    describe('if userResponse is valid', function () {
      it('should return the user response value', function () {
        // given
        const qcuSolution = '12';
        const userResponse = [qcuSolution];
        const expectedUserResponse = userResponse[0];

        const qcu = new QCUForAnswerVerification({
          id: 'qcu-id',
          instruction: '',
          proposals: [{ id: qcuSolution }],
          feedbacks: { valid: 'OK', invalid: 'KO' },
          solution: qcuSolution,
        });

        // when
        qcu.setUserResponse(userResponse);

        // then
        expect(qcu.userResponse).to.deep.equal(expectedUserResponse);
      });
    });

    describe('if userResponse is not valid', function () {
      const cases = [
        {
          case: 'When the response number is not a string',
          userResponse: [1],
        },
        {
          case: 'When the response is not a stringified number',
          userResponse: ['not a number'],
        },
        {
          case: 'When there are more than one response',
          userResponse: ['1', '2'],
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
          const qcuSolution = '1';

          const qcu = new QCUForAnswerVerification({
            id: 'qcu-id',
            instruction: '',
            proposals: [{ id: qcuSolution }],
            feedbacks: { valid: 'OK', invalid: 'KO' },
            solution: qcuSolution,
          });

          // when
          const error = catchErrSync(() => qcu.setUserResponse(userResponse))();

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
        });
      });
    });
  });
});
