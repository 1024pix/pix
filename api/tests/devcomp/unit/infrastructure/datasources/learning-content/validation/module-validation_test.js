import { getDownloadSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/download.sample.js';
import { getImageSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/image.sample.js';
import { getQcmSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/qcm.sample.js';
import { getQcuSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/qcu.sample.js';
import { getQrocmSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/qrocm.sample.js';
import { getTextSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/text.sample.js';
import { getVideoSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/video.sample.js';
import { expect } from '../../../../../../test-helper.js';
import {
  blockInputSchema,
  blockSelectSchema,
  downloadElementSchema,
  imageElementSchema,
  qcmElementSchema,
  qcuElementSchema,
  qrocmElementSchema,
  textElementSchema,
  videoElementSchema,
} from './element/index.js';
import { joiErrorParser } from './joi-error-parser.js';
import { grainSchema, moduleDetailsSchema, moduleSchema } from './module.js';

describe('Unit | Infrastructure | Datasources | Learning Content | Module Datasource | format validation', function () {
  describe('when element has a valid structure', function () {
    it('should validate sample download structure', async function () {
      try {
        await downloadElementSchema.validateAsync(getDownloadSample(), { abortEarly: false });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample image structure', async function () {
      try {
        await imageElementSchema.validateAsync(getImageSample(), { abortEarly: false });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample qcm structure', async function () {
      try {
        await qcmElementSchema.validateAsync(getQcmSample(), { abortEarly: false });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample qcu structure', async function () {
      try {
        await qcuElementSchema.validateAsync(getQcuSample(), { abortEarly: false });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample qrocm structure', async function () {
      try {
        await qrocmElementSchema.validateAsync(getQrocmSample(), { abortEarly: false });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample text structure', async function () {
      try {
        await textElementSchema.validateAsync(getTextSample(), { abortEarly: false });
      } catch (joiError) {
        const formattedError = joiErrorParser.format(joiError);
        expect(joiError).to.equal(undefined, formattedError);
      }
    });

    it('should validate sample video structure', async function () {
      try {
        await videoElementSchema.validateAsync(getVideoSample(), { abortEarly: false });
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
        url: 'https://images.pix.fr/modulix/placeholder-image.svg',
        alt: '<p>cooucou</p>',
        alternativeText: '',
      };

      try {
        await imageElementSchema.validateAsync(invalidImage, { abortEarly: false });
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        expect(joiError.message).to.deep.equal(
          '"alt" failed custom validation because HTML is not allowed in this field',
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
        await videoElementSchema.validateAsync(invalidVideo, { abortEarly: false });
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
        defaultValue: '<div>cassé</div>',
        tolerances: ['t1'],
        solutions: ['@'],
      };

      const expectedErrorMessages = [
        '"input" failed custom validation because HTML is not allowed in this field',
        '"placeholder" failed custom validation because HTML is not allowed in this field',
        '"ariaLabel" failed custom validation because HTML is not allowed in this field',
        '"defaultValue" failed custom validation because HTML is not allowed in this field',
      ];

      try {
        await blockInputSchema.validateAsync(invalidQrocmBlockInput, { abortEarly: false });
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
        defaultValue: '<div>cassé</div>',
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
        '"defaultValue" failed custom validation because HTML is not allowed in this field',
        '"options[0].content" failed custom validation because HTML is not allowed in this field',
      ];

      try {
        await blockSelectSchema.validateAsync(invalidQrocmBlockSelect, { abortEarly: false });
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        expect(joiError.message).to.deep.equal(expectedErrorMessages.join('. '));
      }
    });
  });

  describe('When module contains not allowed HTML', function () {
    it('should throw htmlNotAllowedSchema custom error for title field', async function () {
      // given
      const invalidModule = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'didacticiel-modulix',
        title: '<h1>Didacticiel Modulix</h1>',
        details: {
          image: 'https://images.pix.fr/modulix/placeholder-details.svg',
          description: 'Découvrez avec ce didacticiel comment fonctionne Modulix !',
          duration: 5,
          level: 'Débutant',
          objectives: ['Naviguer dans Modulix', 'Découvrir les leçons et les activités'],
        },
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
                  content: '<h3>Content.</h3>',
                },
              },
            ],
          },
        ],
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

    it('should throw htmlNotAllowedSchema custom error for details.description field', async function () {
      // given
      const invalidModuleDetails = {
        image: 'https://images.pix.fr/modulix/placeholder-details.svg',
        description: '<strong>Découvrez avec ce didacticiel</strong> comment fonctionne Modulix !',
        duration: 5,
        level: 'Débutant',
        objectives: ['Naviguer dans Modulix', 'Découvrir les leçons et les activités'],
      };

      try {
        await moduleDetailsSchema.validateAsync(invalidModuleDetails, { abortEarly: false });
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        expect(joiError.message).to.deep.equal(
          '"description" failed custom validation because HTML is not allowed in this field',
        );
      }
    });

    it('should throw htmlNotAllowedSchema custom error for details.objectives fields', async function () {
      // given
      const invalidModuleDetails = {
        image: 'https://images.pix.fr/modulix/placeholder-details.svg',
        description: 'Découvrez avec ce didacticiel comment fonctionne Modulix !',
        duration: 5,
        level: 'Débutant',
        objectives: ['<span>Naviguer dans Modulix<span>', 'Découvrir les leçons et les activités'],
      };

      try {
        await moduleDetailsSchema.validateAsync(invalidModuleDetails, { abortEarly: false });
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        expect(joiError.message).to.deep.equal(
          '"objectives[0]" failed custom validation because HTML is not allowed in this field',
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
});
