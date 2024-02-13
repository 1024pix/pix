import { expect } from '../../../../../test-helper.js';
import { QCMForAnswerVerification } from '../../../../../../src/devcomp/domain/models/element/QCM-for-answer-verification.js';
import { AnswerStatus } from '../../../../../../src/shared/domain/models/AnswerStatus.js';

describe('Integration | Devcomp | Domain | Models | Element | QCMForAnswerVerification', function () {
  it('should return a valid answer when using tolerances with a right user response', function () {
    // given
    const qcm = new QCMForAnswerVerification({
      id: '98c51fa7-03b7-49b1-8c5e-49341d35909c',
      instruction: '<p>Quels sont les 3 piliers de Pix ?</p>',
      proposals: [
        {
          id: '1',
          content: 'Evaluer ses connaissances et savoir-faire sur 16 compétences du numérique',
        },
        {
          id: '2',
          content: 'Développer son savoir-faire sur les jeux de type TPS',
        },
        {
          id: '3',
          content: 'Développer ses compétences numériques',
        },
        {
          id: '4',
          content: 'Certifier ses compétences Pix',
        },
        {
          id: '5',
          content: 'Evaluer ses compétences de logique et compréhension mathématique',
        },
      ],
      feedbacks: {
        valid: '<p>Correct ! Vous nous avez bien cernés :)</p>',
        invalid: '<p>Et non ! Pix sert à évaluer, certifier et développer ses compétences numériques.',
      },
      solutions: ['1', '3', '4'],
    });
    qcm.setUserResponse(['1', '3', '4']);

    // when
    const correction = qcm.assess();

    // then
    expect(correction.status).to.deep.equal(AnswerStatus.OK);
  });

  it('should return an invalid answer when using tolerances with a wrong user response', function () {
    // given
    const qcm = new QCMForAnswerVerification({
      id: '98c51fa7-03b7-49b1-8c5e-49341d35909c',
      instruction: '<p>Quels sont les 3 piliers de Pix ?</p>',
      proposals: [
        {
          id: '1',
          content: 'Evaluer ses connaissances et savoir-faire sur 16 compétences du numérique',
        },
        {
          id: '2',
          content: 'Développer son savoir-faire sur les jeux de type TPS',
        },
        {
          id: '3',
          content: 'Développer ses compétences numériques',
        },
        {
          id: '4',
          content: 'Certifier ses compétences Pix',
        },
        {
          id: '5',
          content: 'Evaluer ses compétences de logique et compréhension mathématique',
        },
      ],
      feedbacks: {
        valid: '<p>Correct ! Vous nous avez bien cernés :)</p>',
        invalid: '<p>Et non ! Pix sert à évaluer, certifier et développer ses compétences numériques.',
      },
      solutions: ['1', '3', '4'],
    });
    qcm.setUserResponse(['1', '4']);

    // when
    const correction = qcm.assess();

    // then
    expect(correction.status).to.deep.equal(AnswerStatus.KO);
  });
});
