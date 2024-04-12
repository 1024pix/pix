import { QROCMForAnswerVerification } from '../../../../../../src/devcomp/domain/models/element/QROCM-for-answer-verification.js';
import { QrocmCorrectionResponse } from '../../../../../../src/devcomp/domain/models/QrocmCorrectionResponse.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | QrocMForAnswerVerification', function () {
  describe('#constructor', function () {
    it('should instanciate a QROCM For Verification with right attributes', function () {
      // given
      const qrocm = new QROCMForAnswerVerification({
        id: '98c51fa7-03b7-49b1-8c5e-49341d35909c',
        instruction: '<p>Complétez le texte ci-dessous.</p>',
        proposals: [
          {
            input: 'inputBlock',
            type: 'input',
            inputType: 'text',
            size: 1,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 1',
            defaultValue: '',
            tolerances: ['t1', 't2'],
            solutions: ['@'],
          },
          {
            input: 'selectBlock',
            type: 'select',
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 3',
            defaultValue: '',
            tolerances: ['t2', 't3'],
            options: [
              {
                id: '1',
                content: "l'identifiant",
              },
              {
                id: '2',
                content: "le fournisseur d'adresse mail",
              },
            ],
            solutions: ['2'],
          },
        ],
        feedbacks: {
          valid: 'Bravo!',
          invalid: 'Mince!',
        },
      });

      const { value, tolerances } = qrocm.solution;
      // then
      expect(value).deep.equal({
        inputBlock: ['@'],
        selectBlock: ['2'],
      });
      expect(tolerances).deep.equal({
        inputBlock: ['t1', 't2'],
        selectBlock: ['t2', 't3'],
      });
      expect(qrocm.feedbacks).deep.equal({
        valid: 'Bravo!',
        invalid: 'Mince!',
      });
    });

    describe('A QROCM For Verification without feedbacks', function () {
      it('should throw an error', function () {
        expect(
          () =>
            new QROCMForAnswerVerification({
              id: '123',
              instruction: 'toto',
              proposals: [
                {
                  input: 'inputBlock',
                  type: 'input',
                  inputType: 'text',
                  size: 1,
                  display: 'inline',
                  placeholder: '',
                  ariaLabel: 'Réponse 1',
                  defaultValue: '',
                  tolerances: ['t1', 't2'],
                  solutions: ['@'],
                },
              ],
            }),
        ).to.throw('The feedbacks are required for a verification QROCM.');
      });
    });
  });

  describe('#assess', function () {
    it('should return a QrocmCorrectionResponse for a valid answer', function () {
      // given
      const stubedIsOk = sinon.stub().returns(true);
      const assessResult = { result: { isOK: stubedIsOk } };
      const qrocmSolution = {
        inputBlock1: ['courgette'],
        inputBlock2: ['courgette'],
        inputBlock3: ['courgette'],
        selectBlock: ['2'],
      };
      const userResponse = {
        inputBlock1: 'Courgette',
        inputBlock2: 'courgette!',
        inputBlock3: 'cuorgette',
        selectBlock: '2',
      };

      const validator = {
        assess: sinon.stub(),
      };
      const qrocm = new QROCMForAnswerVerification({
        validator,
        id: 'qrocm-id',
        instruction: '<p>Complétez le texte ci-dessous.</p>',
        proposals: [
          {
            input: 'inputBlock1',
            type: 'input',
            inputType: 'text',
            size: 10,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 1',
            defaultValue: '',
            tolerances: ['t1'],
            solutions: ['courgette'],
          },
          {
            input: 'inputBlock2',
            type: 'input',
            inputType: 'text',
            size: 10,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 2',
            defaultValue: '',
            tolerances: ['t2'],
            solutions: ['courgette'],
          },
          {
            input: 'inputBlock3',
            type: 'input',
            inputType: 'text',
            size: 10,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 3',
            defaultValue: '',
            tolerances: ['t3'],
            solutions: ['courgette'],
          },
          {
            input: 'selectBlock',
            type: 'select',
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 3',
            defaultValue: '',
            tolerances: [],
            options: [
              {
                id: '1',
                content: "l'identifiant",
              },
              {
                id: '2',
                content: "le fournisseur d'adresse mail",
              },
            ],
            solutions: ['2'],
          },
        ],
        feedbacks: {
          valid: 'OK',
          invalid: 'KO',
        },
      });
      qrocm.userResponse = userResponse;

      validator.assess
        .withArgs({
          answer: {
            value: userResponse,
          },
        })
        .returns(assessResult);

      const expectedCorrection = {
        status: assessResult.result,
        feedback: qrocm.feedbacks.valid,
        solution: qrocmSolution,
      };

      // when
      const correction = qrocm.assess();

      // then
      expect(correction).to.deep.equal(expectedCorrection);
      expect(correction).to.deepEqualInstance(new QrocmCorrectionResponse(expectedCorrection));
    });

    it('should return a QrocmCorrectionResponse for an invalid answer', function () {
      // given
      const stubedIsOk = sinon.stub().returns(false);
      const assessResult = { result: { isOK: stubedIsOk } };
      const qrocmSolution = {
        inputBlock1: ['courgette'],
        inputBlock2: ['courgette'],
        inputBlock3: ['courgette'],
        selectBlock: ['2'],
      };
      const userResponse = {
        inputBlock1: 'kourgette',
        inputBlock2: 'kourgette',
        inputBlock3: 'zucchini',
        selectBlock: '2',
      };

      const validator = {
        assess: sinon.stub(),
      };
      const qrocm = new QROCMForAnswerVerification({
        validator,
        id: 'qrocm-id',
        instruction: '<p>Complétez le texte ci-dessous.</p>',
        proposals: [
          {
            input: 'inputBlock1',
            type: 'input',
            inputType: 'text',
            size: 10,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 1',
            defaultValue: '',
            tolerances: ['t1'],
            solutions: ['courgette'],
          },
          {
            input: 'inputBlock2',
            type: 'input',
            inputType: 'text',
            size: 10,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 2',
            defaultValue: '',
            tolerances: ['t2'],
            solutions: ['courgette'],
          },
          {
            input: 'inputBlock3',
            type: 'input',
            inputType: 'text',
            size: 10,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 3',
            defaultValue: '',
            tolerances: ['t3'],
            solutions: ['courgette'],
          },
          {
            input: 'selectBlock',
            type: 'select',
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 3',
            defaultValue: '',
            tolerances: [],
            options: [
              {
                id: '1',
                content: "l'identifiant",
              },
              {
                id: '2',
                content: "le fournisseur d'adresse mail",
              },
            ],
            solutions: ['2'],
          },
        ],
        feedbacks: {
          valid: 'OK',
          invalid: 'KO',
        },
      });
      qrocm.userResponse = userResponse;

      validator.assess
        .withArgs({
          answer: {
            value: userResponse,
          },
        })
        .returns(assessResult);

      const expectedCorrection = {
        status: assessResult.result,
        feedback: qrocm.feedbacks.invalid,
        solution: qrocmSolution,
      };

      // when
      const correction = qrocm.assess();

      // then
      expect(correction).to.deep.equal(expectedCorrection);
      expect(correction).to.deepEqualInstance(new QrocmCorrectionResponse(expectedCorrection));
    });
  });

  describe('#setUserResponse', function () {
    describe('if userResponse is valid', function () {
      it('should return the user response value', function () {
        // given
        const userResponse = [
          { input: 'emailSeparatorCharacter', answer: '@' },
          { input: 'emailFirstPartSelect', answer: '1' },
          { input: 'emailSecondPartSelect', answer: '2' },
        ];

        const expectedUserResponse = {
          emailSeparatorCharacter: '@',
          emailFirstPartSelect: '1',
          emailSecondPartSelect: '2',
        };

        const qrocm = new QROCMForAnswerVerification({
          id: 'qrocm-id',
          instruction: '<p>Complétez le texte ci-dessous.</p>',
          proposals: [
            {
              input: 'emailSeparatorCharacter',
              type: 'input',
              inputType: 'text',
              size: 1,
              display: 'inline',
              placeholder: '',
              ariaLabel: 'Réponse 1',
              defaultValue: '',
              tolerances: [],
              solutions: ['@'],
            },
            {
              input: 'emailFirstPartSelect',
              type: 'select',
              display: 'inline',
              placeholder: '',
              ariaLabel: 'Réponse 3',
              defaultValue: '',
              tolerances: [],
              options: [
                {
                  id: '1',
                  content: "l'identifiant",
                },
                {
                  id: '2',
                  content: "le fournisseur d'adresse mail",
                },
              ],
              solutions: ['1'],
            },
            {
              input: 'emailSecondPartSelect',
              type: 'select',
              display: 'inline',
              placeholder: '',
              ariaLabel: 'Réponse 4',
              defaultValue: '',
              tolerances: [],
              options: [
                {
                  id: '1',
                  content: "l'identifiant",
                },
                {
                  id: '2',
                  content: "le fournisseur d'adresse mail",
                },
              ],
              solutions: ['2'],
            },
          ],
          feedbacks: {
            valid: 'OK',
            invalid: 'KO',
          },
        });

        // when
        qrocm.setUserResponse(userResponse);

        // then
        expect(qrocm.userResponse).to.deep.equal(expectedUserResponse);
      });
    });

    describe('if userResponse is not valid', function () {
      const cases = [
        {
          case: 'When an input field name is not valid',
          userResponse: [
            { input: 'inputBlock', answer: '@' },
            { invalidField: 'selectBlock', answer: '2' },
          ],
        },
        {
          case: 'When an answer field name is not valid',
          userResponse: [
            { input: 'inputBlock', answer: '@' },
            { input: 'selectBlock', invalidAnswerField: '2' },
          ],
        },
        {
          case: 'When an input value is not valid',
          userResponse: [
            { input: 'inputBlock', answer: '@' },
            { input: 12, answer: '2' },
          ],
        },
        {
          case: 'When an answer value is not valid',
          userResponse: [
            { input: 'inputBlock', answer: '@' },
            { input: 'selectBlock', answers: 2 },
          ],
        },
        {
          case: 'When a field is missing',
          userResponse: [{ input: 'inputBlock' }],
        },
        {
          case: 'When there are more fields than expected',
          userResponse: [{ input: 'inputBlock', answer: '@', extraField: true }],
        },
        {
          case: 'When the userResponse is not an array',
          userResponse: 'invalid userResponse',
        },
        {
          case: 'When the userResponse does not contain valid item',
          userResponse: ['invalid array content'],
        },
        {
          case: 'When the userResponse is undefined',
          userResponse: undefined,
        },
      ];
      // eslint-disable-next-line mocha/no-setup-in-describe
      cases.forEach((testCase) => {
        it(`${testCase.case}, should throw error`, function () {
          // given
          const userResponse = testCase.userResponse;

          const qrocm = new QROCMForAnswerVerification({
            id: 'qrocm-id',
            instruction: '<p>Complétez le texte ci-dessous.</p>',
            proposals: [
              {
                input: 'inputBlock',
                type: 'input',
                inputType: 'text',
                size: 1,
                display: 'inline',
                placeholder: '',
                ariaLabel: 'Réponse 1',
                defaultValue: '',
                tolerances: [],
                solutions: ['@'],
              },
              {
                input: 'selectBlock',
                type: 'select',
                display: 'inline',
                placeholder: '',
                ariaLabel: 'Réponse 3',
                defaultValue: '',
                tolerances: [],
                options: [
                  {
                    id: '1',
                    content: "l'identifiant",
                  },
                  {
                    id: '2',
                    content: "le fournisseur d'adresse mail",
                  },
                ],
                solutions: ['2'],
              },
            ],
            feedbacks: {
              valid: 'OK',
              invalid: 'KO',
            },
          });

          // when/then
          expect(() => qrocm.setUserResponse(userResponse)).to.throw(EntityValidationError);
        });
      });
    });
  });
});
