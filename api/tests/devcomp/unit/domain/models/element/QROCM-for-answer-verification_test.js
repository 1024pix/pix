import { expect, sinon } from '../../../../../test-helper.js';
import { QROCMForAnswerVerification } from '../../../../../../src/devcomp/domain/models/element/QROCM-for-answer-verification.js';
import { ElementAnswer } from '../../../../../../src/devcomp/domain/models/ElementAnswer.js';
import { QrocmCorrectionResponse } from '../../../../../../src/devcomp/domain/models/QrocmCorrectionResponse.js';

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

      // then
      expect(qrocm.solutions).deep.equal({
        inputBlock: ['@'],
        selectBlock: ['2'],
      });
      expect(qrocm.tolerances).deep.equal(['t1', 't2', 't3']);
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
        ).to.throw('Les feedbacks sont obligatoires pour un QROCM de vérification');
      });
    });
  });

  describe('#assess', function () {
    it('should return a QrocmCorrectionResponse for a valid answer', function () {
      // given
      const stubedIsOk = sinon.stub().returns(true);
      const assessResult = { result: { isOK: stubedIsOk } };
      const qrocmSolution = { inputBlock: ['@'], selectBlock: ['2'] };
      const userResponse = [
        { input: 'inputBlock', answer: '@' },
        { input: 'selectBlock', answer: '2' },
      ];

      const validator = {
        assess: sinon.stub(),
      };
      validator.assess
        .withArgs({
          answer: {
            value: { inputBlock: '@', selectBlock: '2' },
          },
        })
        .returns(assessResult);
      const qrocm = new QROCMForAnswerVerification({
        validator,
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

      const expectedResult = {
        elementId: 'qrocm-id',
        userResponseValue: { inputBlock: '@', selectBlock: '2' },
        correction: {
          status: assessResult.result,
          feedback: qrocm.feedbacks.valid,
          solutionValue: qrocmSolution,
        },
      };

      // when
      const result = qrocm.assess(userResponse);

      // then
      expect(result).to.deep.equal(expectedResult);
      expect(result).to.be.instanceOf(ElementAnswer);
      expect(result.correction).to.be.instanceOf(QrocmCorrectionResponse);
    });

    it('should return a QrocmCorrectionResponse for an invalid answer', function () {
      // given
      const stubedIsOk = sinon.stub().returns(false);
      const assessResult = { result: { isOK: stubedIsOk } };
      const qrocmSolution = { inputBlock: ['@'], selectBlock: ['2'] };
      const userResponse = [
        { input: 'inputBlock', answer: '#' },
        { input: 'selectBlock', answer: '1' },
      ];

      const validator = {
        assess: sinon.stub(),
      };
      validator.assess
        .withArgs({
          answer: {
            value: { inputBlock: '#', selectBlock: '1' },
          },
        })
        .returns(assessResult);
      const qrocm = new QROCMForAnswerVerification({
        validator,
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

      const expectedResult = {
        elementId: 'qrocm-id',
        userResponseValue: { inputBlock: '#', selectBlock: '1' },
        correction: {
          status: assessResult.result,
          feedback: qrocm.feedbacks.invalid,
          solutionValue: qrocmSolution,
        },
      };

      // when
      const result = qrocm.assess(userResponse);

      // then
      expect(result).to.deep.equal(expectedResult);
      expect(result).to.be.instanceOf(ElementAnswer);
      expect(result.correction).to.be.instanceOf(QrocmCorrectionResponse);
    });
  });
});
