import { EmbedForAnswerVerification } from '../../../../../../src/devcomp/domain/models/element/Embed-for-answer-verification.js';
import { EmbedCorrectionResponse } from '../../../../../../src/devcomp/domain/models/EmbedCorrectionResponse.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | EmbedForAnswerVerification', function () {
  describe('#constructor', function () {
    it('should instanciate an embed For Verification with right attributes', function () {
      // Given
      const solution = Symbol('solution');
      const expectedSolution = { value: solution };

      // When
      const embed = new EmbedForAnswerVerification({
        id: '123',
        title: 'Embed instance',
        instruction: 'instruction',
        solution,
        url: 'http://embed.example.net',
        height: 800,
      });

      // Then
      expect(embed.id).equal('123');
      expect(embed.instruction).equal('instruction');
      expect(embed.solution).deep.equal(expectedSolution);
    });

    describe('An embed For Verification without a solution', function () {
      it('should throw an error', function () {
        expect(
          () =>
            new EmbedForAnswerVerification({
              id: '123',
              title: 'Embed',
              height: 800,
              url: 'https://embed.example.net',
              instruction: 'toto',
            }),
        ).to.throw('The solution is required for a verification embed');
      });
    });
  });

  describe('#assess', function () {
    it('should return an EmbedCorrectionResponse for a valid answer', function () {
      // given
      const stubedIsOk = sinon.stub().returns(true);
      const assessResult = { result: { isOK: stubedIsOk } };
      const embedSolution = Symbol('correctSolution');
      const userResponse = embedSolution;

      const validator = {
        assess: sinon.stub(),
      };
      const embed = new EmbedForAnswerVerification({
        id: 'embed-id',
        instruction: '',
        title: 'Embed for a valid answer',
        height: 800,
        url: 'https://embed.example.net',
        solution: embedSolution,
        validator,
      });
      embed.userResponse = userResponse;

      validator.assess
        .withArgs({
          answer: {
            value: userResponse,
          },
        })
        .returns(assessResult);

      const expectedCorrection = {
        status: assessResult.result,
        feedback: '',
        solution: embedSolution,
      };

      // when
      const correction = embed.assess();

      // then
      expect(correction).to.deep.equal(expectedCorrection);
      expect(correction).to.deepEqualInstance(new EmbedCorrectionResponse(expectedCorrection));
    });

    it('should return an EmbedCorrectionResponse for a invalid answer', function () {
      // given
      const stubedIsOk = sinon.stub().returns(false);
      const assessResult = { result: { isOK: stubedIsOk } };
      const embedSolution = Symbol('correctSolution');
      const userResponse = 'wrongAnswer';

      const validator = {
        assess: sinon.stub(),
      };
      const embed = new EmbedForAnswerVerification({
        id: 'embed-id',
        title: 'Embed for an invalid answer',
        height: 800,
        url: 'https://embed.example.net',
        instruction: '',
        solution: embedSolution,
        validator,
      });
      embed.userResponse = userResponse;

      validator.assess
        .withArgs({
          answer: {
            value: userResponse,
          },
        })
        .returns(assessResult);

      const expectedCorrection = {
        status: assessResult.result,
        feedback: '',
        solution: embedSolution,
      };

      // when
      const correction = embed.assess();

      // then
      expect(correction).to.deep.equal(expectedCorrection);
      expect(correction).to.deepEqualInstance(new EmbedCorrectionResponse(expectedCorrection));
    });
  });

  describe('#setUserResponse', function () {
    describe('if userResponse is valid', function () {
      it('should return the user response value', function () {
        // given;

        const embed = new EmbedForAnswerVerification({
          id: 'embed-id',
          title: 'Embed',
          height: 800,
          url: 'https://embed.example.net',
          instruction: '',
          solution: 'toto',
        });

        // when
        embed.setUserResponse(['toto']);

        // then
        expect(embed.userResponse).to.deep.equal('toto');
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
          const embedSolution = '1';

          const embed = new EmbedForAnswerVerification({
            id: 'embed-id',
            title: 'Embed',
            height: 800,
            url: 'https://embed.example.net',
            instruction: '',
            solution: embedSolution,
          });

          // when/then
          expect(() => embed.setUserResponse(userResponse)).to.throw(EntityValidationError);
        });
      });
    });
  });
});
