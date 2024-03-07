import { QROCMForAnswerVerification } from '../../../../../../src/devcomp/domain/models/element/QROCM-for-answer-verification.js';
import { AnswerStatus } from '../../../../../../src/shared/domain/models/AnswerStatus.js';
import { expect } from '../../../../../test-helper.js';

describe('Integration | Devcomp | Domain | Models | Element | QROCMForAnswerVerification', function () {
  it('should return a valid answer when using tolerances with a right user response', function () {
    // given
    const qrocm = new QROCMForAnswerVerification({
      id: '98c51fa7-03b7-49b1-8c5e-49341d35909c',
      instruction: '<p>Complétez le texte ci-dessous.</p>',
      proposals: [
        {
          input: 'appName',
          type: 'input',
          inputType: 'text',
          size: 1,
          display: 'inline',
          placeholder: '',
          ariaLabel: 'Réponse 1',
          defaultValue: '',
          tolerances: ['t1', 't2'],
          solutions: ['Modulix'],
        },
      ],
      feedbacks: {
        valid: 'Bravo!',
        invalid: 'Mince!',
      },
    });
    qrocm.setUserResponse([
      {
        input: 'appName',
        answer: 'modulix!',
      },
    ]);

    // when
    const correction = qrocm.assess();

    // then
    expect(correction.status).to.deep.equal(AnswerStatus.OK);
  });

  it('should return an invalid answer when using tolerances with a wrong user response', function () {
    // given
    const qrocm = new QROCMForAnswerVerification({
      id: '98c51fa7-03b7-49b1-8c5e-49341d35909c',
      instruction: '<p>Complétez le texte ci-dessous.</p>',
      proposals: [
        {
          input: 'appName',
          type: 'input',
          inputType: 'text',
          size: 1,
          display: 'inline',
          placeholder: '',
          ariaLabel: 'Réponse 1',
          defaultValue: '',
          tolerances: [],
          solutions: ['Modulix'],
        },
      ],
      feedbacks: {
        valid: 'Bravo!',
        invalid: 'Mince!',
      },
    });
    qrocm.setUserResponse([
      {
        input: 'appName',
        answer: 'modulix',
      },
    ]);

    // when
    const correction = qrocm.assess();

    // then
    expect(correction.status).to.deep.equal(AnswerStatus.KO);
  });
});
