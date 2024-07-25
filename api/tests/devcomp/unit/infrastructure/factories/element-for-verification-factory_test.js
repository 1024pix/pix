import { ElementInstantiationError } from '../../../../../src/devcomp/domain/errors.js';
import { EmbedForAnswerVerification } from '../../../../../src/devcomp/domain/models/element/Embed-for-answer-verification.js';
import { QCMForAnswerVerification } from '../../../../../src/devcomp/domain/models/element/QCM-for-answer-verification.js';
import { QCUForAnswerVerification } from '../../../../../src/devcomp/domain/models/element/QCU-for-answer-verification.js';
import { QROCMForAnswerVerification } from '../../../../../src/devcomp/domain/models/element/QROCM-for-answer-verification.js';
import { ElementForVerificationFactory } from '../../../../../src/devcomp/infrastructure/factories/element-for-verification-factory.js';
import { logger } from '../../../../../src/shared/infrastructure/utils/logger.js';
import { catchErrSync, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Infrastructure | Factories | ElementForVerification', function () {
  describe('#toDomain', function () {
    describe('when data is incorrect', function () {
      it('should throw an ElementInstantiationError', function () {
        // given
        const feedbacks = { valid: 'valid', invalid: 'invalid' };
        const proposals = [
          { id: '1', content: 'toto' },
          { id: '2', content: 'foo' },
        ];

        const dataWithMissingSolutionForQCU = {
          id: '123',
          instruction: 'instruction',
          locales: ['fr-FR'],
          proposals,
          feedbacks,
          type: 'qcu',
        };

        // when
        const error = catchErrSync(ElementForVerificationFactory.build)(dataWithMissingSolutionForQCU);

        // then
        expect(error).to.be.an.instanceOf(ElementInstantiationError);
        expect(error.message).to.deep.equal('The solution is required for a verification QCU');
      });

      describe('when the element has a unknown type', function () {
        it('should log the error', function () {
          // given
          const elementData = {
            id: '123',
            instruction: 'instruction',
            locales: ['fr-FR'],
            proposals: [
              { id: '1', content: 'toto' },
              { id: '2', content: 'foo' },
            ],
            feedbacks: { valid: 'valid', invalid: 'invalid' },
            type: 'unknown',
            solution: '1',
          };
          sinon.stub(logger, 'warn').returns();

          // when
          ElementForVerificationFactory.build(elementData);

          // then
          expect(logger.warn).to.have.been.calledWithExactly({
            event: 'module_element_type_not_handled_for_verification',
            message: `Element type not handled for verification: unknown`,
          });
        });
      });
    });

    it('should instantiate a EmbedForAnswerVerification when given a data of type "embed"', function () {
      // given
      const feedbacks = { valid: 'valid', invalid: 'invalid' };

      const elementData = {
        id: '123',
        title: 'An embed',
        instruction: 'instruction',
        feedbacks,
        type: 'embed',
        solution: 'solution',
        url: 'http://embed.example.net',
        height: 800,
      };

      // when
      const element = ElementForVerificationFactory.build(elementData);

      // then
      expect(element).to.be.an.instanceOf(EmbedForAnswerVerification);
    });

    it('should instantiate a QCUForAnswerVerification when given a data of type "qcu"', function () {
      // given
      const feedbacks = { valid: 'valid', invalid: 'invalid' };
      const proposals = [
        { id: '1', content: 'toto' },
        { id: '2', content: 'foo' },
      ];

      const elementData = {
        id: '123',
        instruction: 'instruction',
        locales: ['fr-FR'],
        proposals,
        feedbacks,
        type: 'qcu',
        solution: proposals[0].id,
      };

      // when
      const element = ElementForVerificationFactory.build(elementData);

      // then
      expect(element).to.be.an.instanceOf(QCUForAnswerVerification);
    });

    it('should instantiate a QCMForAnswerVerification when given a data of type "qcm"', function () {
      // given
      const elementData = {
        id: '30701e93-1b4d-4da4-b018-fa756c07d53f',
        type: 'qcm',
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
      };

      // when
      const element = ElementForVerificationFactory.build(elementData);

      // then
      expect(element).to.be.an.instanceOf(QCMForAnswerVerification);
    });

    it('should instantiate a QROCMForAnswerVerification when given a data of type "qrocm"', function () {
      // given
      const elementData = {
        id: '98c51fa7-03b7-49b1-8c5e-49341d35909c',
        type: 'qrocm',
        instruction:
          "<p>Pour être sûr que tout est clair, complétez le texte ci-dessous <span aria-hidden='true'>🧩</span></p><p>Si vous avez besoin d’aide, revenez en arrière <span aria-hidden='true'>⬆️</span></p>",
        proposals: [
          {
            type: 'text',
            content: '<p>Le symbole</>',
          },
          {
            input: 'symbole',
            type: 'input',
            inputType: 'text',
            size: 1,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 1',
            defaultValue: '',
            tolerances: ['t1'],
            solutions: ['@'],
          },
          {
            input: 'premiere-partie',
            type: 'select',
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 2',
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
        ],
        feedbacks: {
          valid: '<p>Bravo ! 🎉 </p>',
          invalid: "<p class='pix-list-inline'>Et non !</p>",
        },
      };

      // when
      const element = ElementForVerificationFactory.build(elementData);

      // then
      expect(element).to.be.an.instanceOf(QROCMForAnswerVerification);
    });
  });
});
