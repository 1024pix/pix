import { randomUUID } from 'node:crypto';

import { audioElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/audio-schema.js';
import { customDraftElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/custom-draft-element-schema.js';
import { customElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/custom-element-schema.js';
import { downloadElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/download-schema.js';
import { embedElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/embed-schema.js';
import { flashcardsElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/flashcards-schema.js';
import { imageElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/image-schema.js';
import { qabElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/qab-schema.js';
import { qcmElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/qcm-schema.js';
import { qcuDiscoveryElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/qcu-discovery-schema.js';
import { qcuElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/qcu-schema.js';
import {
  blockInputSchema,
  blockSelectSchema,
  qrocmElementSchema,
} from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/qrocm-schema.js';
import { separatorElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/separator-schema.js';
import { shortVideoElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/short-video-schema.js';
import { textElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/text-schema.js';
import { videoElementSchema } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/element/video-schema.js';
import {
  componentStepperSchema,
  grainSchema,
  moduleSchema,
} from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/module-schema.js';

import { joiErrorParser } from './joi-error-parser.js';

describe('Unit | Infrastructure | Datasources | Learning Content | Module Datasource | format validation', function () {
  describe('when element has a valid structure', function () {
    describe('when element is a custom element', function () {
      it('should validate sample custom message-conversation structure', async function () {
        try {
          const sample = {
            id: randomUUID(),
            type: 'custom',
            title: 'Mon POI',
            instruction: 'Hello world',
            functionalInstruction: 'Lire la conversation',
            tagName: 'message-conversation',
            props: {
              conversationTitle: 'Conversation entre Naomi et Mickaël à propos d’une adresse mail',
              messages: [
                {
                  userName: 'Naomi',
                  direction: 'outgoing',
                  type: 'Texte',
                  content: 'Salut, tu peux me redonner ton adresse mail stp ? 😇',
                },
                {
                  userName: 'Mickaël',
                  direction: 'incoming',
                  type: 'Texte',
                  content: 'Oui, c’est mickael.aubert123#laposte.net',
                },
                {
                  userName: 'Naomi',
                  direction: 'outgoing',
                  type: 'Texte',
                  content: 'T’es sûr ? 😬',
                },
                {
                  userName: 'Naomi',
                  direction: 'outgoing',
                  type: 'Texte',
                  content: 'Tu veux dire mickael.aubert123@laposte.net',
                },
                {
                  userName: 'Mickaël',
                  direction: 'incoming',
                  type: 'Texte',
                  content: 'Ah oui désolé ! 😣',
                },
                {
                  userName: 'Mickaël',
                  direction: 'incoming',
                  type: 'Texte',
                  content: 'comment tu as su ? ',
                },
                {
                  userName: 'Naomi',
                  direction: 'outgoing',
                  type: 'Texte',
                  content: 'Dans une adresse mail, il y a toujours le symbole arobase !',
                },
              ],
            },
          };

          await customElementSchema.validateAsync(sample, {
            abortEarly: false,
          });
        } catch (joiError) {
          const formattedError = joiErrorParser.format(joiError);
          expect(joiError).to.equal(undefined, formattedError);
        }
      });
    });

    it('should validate sample custom-draft structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'custom-draft',
          title: 'Echange de mails',
          url: 'https://1024pix.github.io/pixmail-alert_avast_b.html',
          instruction: '<p>Vous participez à un échange de mail.</p>',
          height: 400,
        };

        await customDraftElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample download structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'download',
          files: [
            {
              url: 'https://assets.pix.org/modules/placeholder-image.svg',
              format: '.svg',
            },
          ],
        };

        await downloadElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample embed structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'embed',
          isCompletionRequired: true,
          title: 'Simulateur de visioconférence - micro ouvert',
          url: 'https://epreuves.pix.fr/visio/visio.html?mode=modulix-didacticiel',
          instruction:
            '<p>Vous participez à la visioconférence ci-dessous.</p><p>Il y a du bruit à côté de vous.</p><p>Coupez le son de votre micro pour ne pas déranger vos interlocuteurs.</p>',
          solution: 'toto',
          height: 600,
        };

        await embedElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample flashcard structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'flashcards',
          title: "Introduction à l'adresse e-mail",
          instruction: '<p>...</p>',
          introImage: {
            url: 'https://example.org/image.jpeg',
          },
          cards: [
            {
              id: randomUUID(),
              recto: {
                image: {
                  url: 'https://example.org/image.jpeg',
                },
                text: "A quoi sert l'arobase dans mon adresse email ?",
              },
              verso: {
                image: {
                  url: 'https://example.org/image.jpeg',
                },
                text: "Parce que c'est joli",
              },
            },
            {
              id: randomUUID(),
              recto: {
                image: {
                  url: '',
                },
                text: "A quoi sert l'apostrophe typographique ?",
              },
              verso: {
                image: {
                  url: '',
                },
                text: "Parce que c'est joli",
              },
            },
          ],
        };

        await flashcardsElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample image structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'image',
          url: 'https://assets.pix.org/modules/placeholder-image.svg',
          alt: '',
          alternativeText: '',
        };

        await imageElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample qab structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'qab',
          instruction:
            '<p><strong>Maintenant, entraînez-vous sur des exemples concrets !</strong> </p> <p> Pour chaque exemple, choisissez si l’affirmation est <strong>vraie</strong> ou <strong>fausse</strong>.</p>',
          cards: [
            {
              id: randomUUID(),
              image: {
                url: 'https://assets.pix.org/modules/bac-a-sable/boules-de-petanque.jpg',
                altText: 'Plusieurs boules de pétanques',
              },
              text: 'Les boules de pétanques sont creuses ?',
              proposalA: 'Vrai',
              proposalB: 'Faux',
              solution: 'A',
            },
            {
              id: randomUUID(),
              text: 'Les chiens ne transpirent pas.',
              proposalA: 'Vrai',
              proposalB: 'Faux',
              solution: 'B',
            },
            {
              id: randomUUID(),
              image: {
                url: 'https://example.net/',
                altText: '',
              },
              text: 'Les dauphins sont des poissons.',
              proposalA: 'Vrai',
              proposalB: 'Faux',
              solution: 'B',
            },
          ],
          feedback: {
            diagnosis: '<p>Continuez comme ça !</p>',
          },
        };

        await qabElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample qcm structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'qcm',
          instruction: '<p>Une question à choix multiples ?</p>',
          proposals: Array.from(Array(3)).map((_, i) => ({
            id: `${i + 1}`,
            content: `Proposition ${i + 1}`,
          })),
          feedbacks: {
            valid: {
              state: 'Correct !',
              diagnosis: '<p>Un exemple de diagnostic...</p>',
            },
            invalid: {
              state: 'Incorrect !',
              diagnosis: '<p>Un exemple de diagnostic...</p>',
            },
          },
          solutions: ['1', '2'],
          hasShortProposals: false,
        };

        await qcmElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample qcu structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'qcu',
          instruction: '<p>Une question à choix unique ?</p>',
          proposals: Array.from(Array(3)).map((_, i) => ({
            id: `${i + 1}`,
            content: `Proposition ${i + 1}`,
            feedback: { state: 'Correct !', diagnosis: `<p>${i + 1}</p>` },
          })),
          solution: '1',
          hasShortProposals: false,
        };

        await qcuElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample qcu discovery structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'qcu-discovery',
          instruction: '<p>Une question découverte ?</p>',
          proposals: Array.from(Array(4)).map((_, i) => ({
            id: `${i + 1}`,
            content: `Proposition ${i + 1}`,
            feedback: { diagnosis: `<p> Diagnostic ${i + 1}</p>` },
          })),
          solution: '1',
          hasShortProposals: false,
        };

        await qcuDiscoveryElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample qrocm structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'qrocm',
          instruction: '<p>Complétez le texte ci-dessous.</p>',
          proposals: [
            {
              type: 'text',
              content: "<p>Il est possible d'utiliser des textes à champs libres&nbsp;:</p>",
            },
            {
              input: 'symbole-separateur-email',
              type: 'input',
              inputType: 'text',
              size: 1,
              display: 'inline',
              placeholder: '',
              ariaLabel: "Remplir avec le caractère qui permet de séparer les deux parties d'une adresse mail",
              tolerances: ['t1'],
              solutions: ['@'],
            },
            {
              type: 'text',
              content: '<p>On peut aussi utiliser des liste déroulantes&nbsp;:</p>',
            },
            {
              input: 'modulix',
              type: 'select',
              display: 'block',
              placeholder: '',
              ariaLabel: "Choisir l'adjectif le plus adapté",
              tolerances: [],
              options: [
                {
                  id: '1',
                  content: 'Génial',
                },
                {
                  id: '2',
                  content: 'Incroyable',
                },
                {
                  id: '3',
                  content: 'Légendaire',
                },
              ],
              solutions: ['3'],
            },
          ],
          feedbacks: {
            valid: {
              state: 'Correct',
              diagnosis: '<p> Un exemple de feedback </p>',
            },
            invalid: {
              state: 'Incorrect !',
              diagnosis: '<p> Un exemple de feedback </p>',
            },
          },
        };

        await qrocmElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample separator structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'separator',
        };

        await separatorElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample text structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'text',
          tag: 'tip',
          content: "<p>Ceci est un texte qui accepte de l'HTML.</p>",
        };

        await textElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    describe('for text element', function () {
      it('should validate all tag values', async function () {
        const validTags = [' ', 'context', 'did-you-know', 'further-information', 'tip'];

        for (const tag of validTags) {
          try {
            const sample = {
              id: randomUUID(),
              type: 'text',
              tag,
              content: "<p>Ceci est un texte qui accepte de l'HTML.</p>",
            };

            await textElementSchema.validateAsync(sample, {
              abortEarly: false,
            });
          } catch (joiError) {
            const formattedError = joiErrorParser.format(joiError);
            expect(joiError).to.equal(undefined, formattedError);
          }
        }
      });
    });

    it('should validate sample video structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'video',
          title: 'Une vidéo',
          url: 'https://assets.pix.org/modules/placeholder-video.mp4',
          subtitles: 'https://assets.pix.org/modules/placeholder-video.vtt',
          transcription: '<p>Vidéo manquante</p>',
        };

        await videoElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample short video structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'short-video',
          title: 'Une vidéo courte',
          url: 'https://assets.pix.org/modules/placeholder-video.mp4',
          transcription: 'Je clique sur le bouton droit de la souris.',
        };

        await shortVideoElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample audio structure', async function () {
      try {
        const sample = {
          id: randomUUID(),
          type: 'audio',
          title: 'Un audio',
          url: 'https://assets.pix.org/modules/placeholder-audio.mp3',
          transcription: '<p>Audio manquant</p>',
        };

        await audioElementSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate stepper structure', async function () {
      try {
        const sample = {
          type: 'stepper',
          instruction: 'Ceci est une instruction pour un stepper',
          steps: [
            {
              elements: [
                {
                  id: '1cf5b276-9ce0-4b38-a56b-4d4447b34d8a',
                  type: 'text',
                  tag: ' ',
                  content: '<p>Cool</p>',
                },
              ],
            },
            {
              elements: [
                {
                  id: '185881f1-6217-4306-8e89-070281a3e20a',
                  type: 'text',
                  tag: ' ',
                  content: '<p>Gang</p>',
                },
              ],
            },
          ],
        };

        await componentStepperSchema.validateAsync(sample, {
          abortEarly: false,
        });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });
  });

  describe('when element contains not allowed HTML', function () {
    it('should throw htmlNotAllowedSchema custom error for image.alt field', async function () {
      // given
      const invalidImage = {
        id: '167907eb-ee0d-4de0-9fc8-609b2b62ed9f',
        type: 'image',
        url: 'https://assets.pix.org/modules/placeholder-image.svg',
        alt: '<p>cooucou</p>',
        alternativeText: '',
      };

      try {
        await imageElementSchema.validateAsync(invalidImage, {
          abortEarly: false,
        });
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        expect(joiError.message).to.deep.equal(
          '"alt" failed custom validation because HTML is not allowed in this field',
        );
      }
    });

    it('should throw htmlNotAllowedSchema custom error for audio.title field', async function () {
      // given
      const invalidAudio = {
        id: '73ac3644-7637-4cee-86d4-1a75f53f0b9c',
        type: 'audio',
        title: '<h1>Un audio</h1>',
        url: 'https://assets.pix.fr/modulix/placeholder-audio.mp3',
        transcription: '<p>Audio manquante</p>',
      };

      try {
        await audioElementSchema.validateAsync(invalidAudio, {
          abortEarly: false,
        });
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        expect(joiError.message).to.deep.equal(
          '"title" failed custom validation because HTML is not allowed in this field',
        );
      }
    });

    it('should throw htmlNotAllowedSchema custom error for video.title field', async function () {
      // given
      const invalidVideo = {
        id: '73ac3644-7637-4cee-86d4-1a75f53f0b9c',
        type: 'video',
        title: '<h1>Une vidéo</h1>',
        url: 'https://videos.pix.fr/modulix/placeholder-video.mp4',
        subtitles: 'https://videos.pix.fr/modulix/placeholder-video.vtt',
        transcription: '<p>Vidéo manquante</p>',
      };

      try {
        await videoElementSchema.validateAsync(invalidVideo, {
          abortEarly: false,
        });
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        expect(joiError.message).to.deep.equal(
          '"title" failed custom validation because HTML is not allowed in this field',
        );
      }
    });

    it('should throw htmlNotAllowedSchema custom error for shortVideo.title field', async function () {
      // given
      const invalidShortVideo = {
        id: '73ac3644-7637-4cee-86d4-1a75f53f0b9c',
        type: 'short-video',
        title: '<h1>Une vidéo</h1>',
        url: 'https://videos.pix.fr/modulix/placeholder-video.mp4',
        transcription: 'Je clique sur le bouton droit de la souris.',
      };

      try {
        await shortVideoElementSchema.validateAsync(invalidShortVideo, {
          abortEarly: false,
        });
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        expect(joiError.message).to.deep.equal(
          '"title" failed custom validation because HTML is not allowed in this field',
        );
      }
    });

    it('should throw htmlNotAllowedSchema custom error for qrocm.blockInput fields', async function () {
      // given
      const invalidQrocmBlockInput = {
        input: '<h2>symbole-separateur-email</h2>',
        type: 'input',
        inputType: 'text',
        size: 1,
        display: 'inline',
        placeholder: '<br> hello',
        ariaLabel: "Remplir avec le <span>caractère</span> qui permet de séparer les deux parties d'une adresse mail",
        tolerances: ['t1'],
        solutions: ['@'],
      };

      const expectedErrorMessages = [
        '"input" failed custom validation because HTML is not allowed in this field',
        '"placeholder" failed custom validation because HTML is not allowed in this field',
        '"ariaLabel" failed custom validation because HTML is not allowed in this field',
      ];

      try {
        await blockInputSchema.validateAsync(invalidQrocmBlockInput, {
          abortEarly: false,
        });
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        expect(joiError.message).to.deep.equal(expectedErrorMessages.join('. '));
      }
    });

    it('should throw htmlNotAllowedSchema custom error for qrocm.blockSelect fields', async function () {
      // given
      const invalidQrocmBlockSelect = {
        input: '<h2>symbole-separateur-email</h2>',
        type: 'select',
        display: 'block',
        placeholder: '<br> hello',
        ariaLabel: "Remplir avec le <span>caractère</span> qui permet de séparer les deux parties d'une adresse mail",
        tolerances: [],
        options: [
          {
            id: '1',
            content: '<strong>Génial</strong>',
          },
        ],
        solutions: ['1'],
      };

      const expectedErrorMessages = [
        '"input" failed custom validation because HTML is not allowed in this field',
        '"placeholder" failed custom validation because HTML is not allowed in this field',
        '"ariaLabel" failed custom validation because HTML is not allowed in this field',
        '"options[0].content" failed custom validation because HTML is not allowed in this field',
      ];

      try {
        await blockSelectSchema.validateAsync(invalidQrocmBlockSelect, {
          abortEarly: false,
        });
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        expect(joiError.message).to.deep.equal(expectedErrorMessages.join('. '));
      }
    });

    it('should throw an html validation error if text element content contains a style tag', async function () {
      // given
      const invalidTextElement = {
        id: '774c4c4e-f170-4e2c-ba7a-d2fe40d053c3',
        type: 'text',
        tag: ' ',
        content: '<style>p { color: indianred; }</style> <p>Stylé !</p>',
      };

      try {
        await textElementSchema.validateAsync(invalidTextElement, {
          abortEarly: false,
        });
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        const message = joiError.details[0].context.value.results[0].messages[0].message;
        expect(message).to.deep.equal('Use external stylesheet with <link> instead of <style> tag');
      }
    });
  });

  describe('When module contains not allowed HTML', function () {
    it('should throw htmlNotAllowedSchema custom error for title field', async function () {
      // given
      const invalidModule = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        shortId: 'gle9d3fz',
        slug: 'bac-a-sable',
        title: '<h1>Bac à sable</h1>',
        isBeta: true,
        visibility: 'public',
        details: {
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          description: 'Découvrez avec ce didacticiel comment fonctionne Modulix !',
          duration: 5,
          level: 'novice',
          tabletSupport: 'comfortable',
          objectives: ['Naviguer dans Modulix', 'Découvrir les leçons et les activités'],
        },
        sections: [
          {
            id: '235c6394-5c43-4dc9-aa77-2895b642de7c',
            type: 'blank',
            grains: [
              {
                id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
                type: 'lesson',
                title: 'Voici une leçon',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: '84726001-1665-457d-8f13-4a74dc4768ea',
                      type: 'text',
                      tag: ' ',
                      content: '<h4>Content.</h4>',
                    },
                  },
                ],
              },
            ],
          },
        ],
        glossary: [],
      };

      try {
        await moduleSchema.validateAsync(invalidModule, { abortEarly: false });
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        expect(joiError.message).to.deep.equal(
          '"title" failed custom validation because HTML is not allowed in this field',
        );
      }
    });

    it('should throw htmlNotAllowedSchema custom error for grains.title field', async function () {
      // given
      const invalidGrain = {
        id: '34d225e8-5d52-4ebd-9acd-8bde8438cfc9',
        type: 'lesson',
        title: '<strong>Sûr de ton adresse mail ?</strong>',
        components: [],
      };

      try {
        await grainSchema.validateAsync(invalidGrain, { abortEarly: false });
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        expect(joiError.message).to.deep.equal(
          '"title" failed custom validation because HTML is not allowed in this field',
        );
      }
    });
  });

  describe('For elements that support short answers', function () {
    describe('when element requires short answers', function () {
      it('should throw an error when an answer is long', async function () {
        // given
        const moduleWithTooLongShortAnswer = _createModuleWithElement({
          id: 'ff22d014-ac30-4159-8b49-02a227766151',
          type: 'qcu',
          instruction: 'Hello',
          hasShortProposals: true,
          proposals: [
            {
              id: '1',
              content: 'Une réponse bien',
              feedback: {
                state: '',
                diagnosis: 'Oui',
              },
            },
            {
              id: '2',
              content: 'Une réponse bien trop longue',
              feedback: {
                state: '',
                diagnosis: 'Non',
              },
            },
          ],
          solution: '1',
        });

        try {
          await moduleSchema.validateAsync(moduleWithTooLongShortAnswer, { abortEarly: false });
          throw new Error('Joi validation should have thrown');
        } catch (joiError) {
          expect(joiError.message).to.deep.equal(
            '"sections[0].grains[0].components[0].element.proposals[1].content" length must be less than or equal to 20 characters long. "sections[0].grains" does not contain 1 required value(s)',
          );
        }
      });

      it('should throw an error when an answer short but contains HTML', async function () {
        // given
        const moduleWithShortAnswerContainingHTML = _createModuleWithElement({
          id: 'ff22d014-ac30-4159-8b49-02a227766151',
          type: 'qcu',
          instruction: 'Hello',
          hasShortProposals: true,
          proposals: [
            {
              id: '1',
              content: 'Une réponse bien',
              feedback: {
                state: '',
                diagnosis: 'Oui',
              },
            },
            {
              id: '2',
              content: '<blink>!</blink>',
              feedback: {
                state: '',
                diagnosis: 'Non',
              },
            },
          ],
          solution: '1',
        });

        try {
          await moduleSchema.validateAsync(moduleWithShortAnswerContainingHTML, { abortEarly: false });
          throw new Error('Joi validation should have thrown');
        } catch (joiError) {
          expect(joiError.message).to.deep.equal(
            '"sections[0].grains[0].components[0].element.proposals[1].content" failed custom validation because HTML is not allowed in this field. "sections[0].grains" does not contain 1 required value(s)',
          );
        }
      });
    });

    describe('when element allows long answers', function () {
      it('should not throw an error when an answer is long', async function () {
        // given
        const moduleWithValidLongAnswer = _createModuleWithElement({
          id: 'ff22d014-ac30-4159-8b49-02a227766151',
          type: 'qcu',
          instruction: 'Hello',
          hasShortProposals: false,
          proposals: [
            {
              id: '1',
              content: 'Une réponse bien',
              feedback: {
                state: '',
                diagnosis: 'Oui',
              },
            },
            {
              id: '2',
              content: 'Une réponse bien trop longue',
              feedback: {
                state: '',
                diagnosis: 'Non',
              },
            },
          ],
          solution: '1',
        });

        try {
          await moduleSchema.validateAsync(moduleWithValidLongAnswer, { abortEarly: false });
        } catch (joiError) {
          const formattedError = joiErrorParser.format(joiError);
          expect(joiError).to.equal(undefined, formattedError);
        }
      });
    });
  });
});

function _createModuleWithElement(element) {
  return {
    id: 'b9a8e4f8-07cb-4448-9007-bb296f91e355',
    shortId: '378523fb',
    slug: 'test-module',
    title: 'Test module',
    isBeta: false,
    visibility: 'public',
    details: {
      image: 'https://assets.pix.org/modules/placeholder-details.svg',
      description: 'Module de test',
      duration: 0,
      level: 'novice',
      objectives: ['Tester les modules'],
      tabletSupport: 'comfortable',
    },
    sections: [
      {
        id: '711c3c8a-b761-43a4-a841-588bfcaed6e8',
        type: 'question-yourself',
        grains: [
          {
            id: '94b2eaed-ccc8-41a1-a7d9-875376cd73e8',
            type: 'short-lesson',
            title: '',
            components: [{ type: 'element', element }],
          },
        ],
      },
    ],
    glossary: [
      {
        word: 'Pix',
        definition:
          'Pix est un service public en ligne pour évaluer, développer, et certifier ses compétences numériques.',
      },
    ],
  };
}
