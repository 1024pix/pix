import { BlockInput } from '../../../../../../src/devcomp/domain/models/block/BlockInput.js';
import { BlockSelect } from '../../../../../../src/devcomp/domain/models/block/BlockSelect.js';
import { BlockSelectOption } from '../../../../../../src/devcomp/domain/models/block/BlockSelectOption.js';
import { BlockText } from '../../../../../../src/devcomp/domain/models/block/BlockText.js';
import { Image } from '../../../../../../src/devcomp/domain/models/element/Image.js';
import { QCM } from '../../../../../../src/devcomp/domain/models/element/QCM.js';
import { QCU } from '../../../../../../src/devcomp/domain/models/element/QCU.js';
import { QROCM } from '../../../../../../src/devcomp/domain/models/element/QROCM.js';
import { Text } from '../../../../../../src/devcomp/domain/models/element/Text.js';
import { Video } from '../../../../../../src/devcomp/domain/models/element/Video.js';
import { Module } from '../../../../../../src/devcomp/domain/models/module/Module.js';
import * as moduleSerializer from '../../../../../../src/devcomp/infrastructure/serializers/jsonapi/module-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | DevComp | Infrastructure | Serializers | Jsonapi | ModuleSerializer', function () {
  describe('#serialize', function () {
    it('should serialize with empty grains list', function () {
      // given
      const id = 'id';
      const slug = 'bien-ecrire-son-adresse-mail';
      const title = 'Bien écrire son adresse mail';
      const details = {
        image: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-details.svg',
        description:
          'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
        duration: 12,
        level: 'Débutant',
        objectives: [
          'Écrire une adresse mail correctement, en évitant les erreurs courantes',
          'Connaître les parties d’une adresse mail et les identifier sur des exemples',
          'Comprendre les fonctions des parties d’une adresse mail',
        ],
      };
      const moduleFromDomain = new Module({ id, details, slug, title, grains: [] });
      const expectedJson = {
        data: {
          type: 'modules',
          id: slug,
          attributes: {
            title,
            'transition-texts': [],
            details,
          },
          relationships: {
            grains: {
              data: [],
            },
          },
        },
      };

      // when
      const json = moduleSerializer.serialize(moduleFromDomain);

      // then
      expect(json).to.deep.equal(expectedJson);
    });

    it('should serialize with grains list of elements only', function () {
      // given
      const id = 'id';
      const slug = 'bien-ecrire-son-adresse-mail';
      const title = 'Bien écrire son adresse mail';
      const details = {
        image: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-details.svg',
        description:
          'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
        duration: 12,
        level: 'Débutant',
        objectives: [
          'Écrire une adresse mail correctement, en évitant les erreurs courantes',
          'Connaître les parties d’une adresse mail et les identifier sur des exemples',
          'Comprendre les fonctions des parties d’une adresse mail',
        ],
      };
      const transitionTexts = [
        {
          content: '<p>content</p>',
          grainId: '1',
        },
      ];
      const moduleFromDomain = new Module({
        id,
        slug,
        title,
        details,
        transitionTexts,
        grains: [
          {
            id: '1',
            title: 'Grain 1',
            type: 'activity',
            // ToDo PIX-12363 migrate to components
            elements: getElements(),
          },
        ],
      });
      const expectedJson = {
        data: {
          attributes: {
            title: 'Bien écrire son adresse mail',
            'transition-texts': transitionTexts,
            details,
          },
          id: 'bien-ecrire-son-adresse-mail',
          relationships: {
            grains: {
              data: [
                {
                  id: '1',
                  type: 'grains',
                },
              ],
            },
          },
          type: 'modules',
        },
        included: [
          {
            attributes: {
              title: 'Grain 1',
              // ToDo PIX-12363 migrate to components
              elements: getAttributesElements(),
              type: 'activity',
            },
            id: '1',
            type: 'grains',
          },
        ],
      };

      // when
      const json = moduleSerializer.serialize(moduleFromDomain);

      // then
      expect(json).to.deep.equal(expectedJson);
    });

    it('should serialize with grains list of elements and components', function () {
      // given
      const id = 'id';
      const slug = 'bien-ecrire-son-adresse-mail';
      const title = 'Bien écrire son adresse mail';
      const details = {
        image: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-details.svg',
        description:
          'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
        duration: 12,
        level: 'Débutant',
        objectives: [
          'Écrire une adresse mail correctement, en évitant les erreurs courantes',
          'Connaître les parties d’une adresse mail et les identifier sur des exemples',
          'Comprendre les fonctions des parties d’une adresse mail',
        ],
      };
      const transitionTexts = [
        {
          content: '<p>content</p>',
          grainId: '1',
        },
      ];
      const moduleFromDomain = new Module({
        id,
        slug,
        title,
        details,
        transitionTexts,
        grains: [
          {
            id: '1',
            title: 'Grain 1',
            type: 'activity',
            // ToDo PIX-12363 migrate to components
            elements: getElements(),
            components: getElements().map((element) => ({ element: element, type: 'element' })),
          },
        ],
      });
      const expectedJson = {
        data: {
          attributes: {
            title: 'Bien écrire son adresse mail',
            'transition-texts': transitionTexts,
            details,
          },
          id: 'bien-ecrire-son-adresse-mail',
          relationships: {
            grains: {
              data: [
                {
                  id: '1',
                  type: 'grains',
                },
              ],
            },
          },
          type: 'modules',
        },
        included: [
          {
            attributes: {
              title: 'Grain 1',
              // ToDo PIX-12363 migrate to components
              elements: getAttributesElements(),
              components: getAttributesElements().map((element) => ({ element: element, type: 'element' })),
              type: 'activity',
            },
            id: '1',
            type: 'grains',
          },
        ],
      };

      // when
      const json = moduleSerializer.serialize(moduleFromDomain);

      // then
      expect(json).to.deep.equal(expectedJson);
    });
  });
});

function getElements() {
  return [
    new Text({ id: '1', content: 'toto' }),
    new QCU({
      id: '2',
      proposals: [{ id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'toto' }],
      instruction: 'hello',
    }),
    new QCM({
      id: '2000',
      proposals: [
        { id: '1', content: 'toto' },
        { id: '2', content: 'tata' },
        { id: '3', content: 'titi' },
      ],
      instruction: 'hello',
    }),
    new QROCM({
      id: '100',
      instruction: '',
      locales: ['fr-FR'],
      proposals: [
        new BlockText({
          content: '<p>Adresse mail de Naomi : ${email}</p>',
        }),
        new BlockInput({
          input: 'email',
          inputType: 'text',
          size: 10,
          display: 'inline',
          placeholder: '',
          ariaLabel: 'Adresse mail de Naomi',
          defaultValue: '',
          tolerances: [],
          solutions: ['naomizao@yahoo.com', 'naomizao@yahoo.fr'],
        }),
        new BlockSelect({
          input: 'seconde-partie',
          display: 'inline',
          placeholder: '',
          ariaLabel: 'Réponse 3',
          defaultValue: '',
          tolerances: [],
          options: [
            new BlockSelectOption({
              id: '1',
              content: "l'identifiant",
            }),
            new BlockSelectOption({
              id: '2',
              content: "le fournisseur d'adresse mail",
            }),
          ],
          solutions: ['2'],
        }),
      ],
    }),
    new Image({ id: '3', url: 'url', alt: 'alt', alternativeText: 'alternativeText' }),
    new Video({
      id: '4',
      title: 'title',
      url: 'url',
      subtitles: 'subtitles',
      transcription: 'transcription',
    }),
  ];
}

function getAttributesElements() {
  return [
    {
      content: 'toto',
      id: '1',
      isAnswerable: false,
      type: 'text',
    },
    {
      id: '2',
      instruction: 'hello',
      isAnswerable: true,
      locales: undefined,
      proposals: [
        {
          content: 'toto',
          id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
        },
      ],
      type: 'qcu',
    },
    {
      id: '2000',
      instruction: 'hello',
      isAnswerable: true,
      locales: undefined,
      proposals: [
        {
          content: 'toto',
          id: '1',
        },
        {
          content: 'tata',
          id: '2',
        },
        {
          content: 'titi',
          id: '3',
        },
      ],
      type: 'qcm',
    },
    {
      id: '100',
      instruction: '',
      isAnswerable: true,
      locales: ['fr-FR'],
      proposals: [
        {
          content: '<p>Adresse mail de Naomi : ${email}</p>',
          type: 'text',
        },
        {
          ariaLabel: 'Adresse mail de Naomi',
          defaultValue: '',
          display: 'inline',
          input: 'email',
          inputType: 'text',
          placeholder: '',
          size: 10,
          solutions: ['naomizao@yahoo.com', 'naomizao@yahoo.fr'],
          tolerances: [],
          type: 'input',
        },
        {
          ariaLabel: 'Réponse 3',
          defaultValue: '',
          display: 'inline',
          input: 'seconde-partie',
          options: [
            {
              content: "l'identifiant",
              id: '1',
            },
            {
              content: "le fournisseur d'adresse mail",
              id: '2',
            },
          ],
          placeholder: '',
          solutions: ['2'],
          tolerances: [],
          type: 'select',
        },
      ],
      type: 'qrocm',
    },
    {
      alt: 'alt',
      alternativeText: 'alternativeText',
      id: '3',
      isAnswerable: false,
      type: 'image',
      url: 'url',
    },
    {
      id: '4',
      isAnswerable: false,
      subtitles: 'subtitles',
      title: 'title',
      transcription: 'transcription',
      type: 'video',
      url: 'url',
    },
  ];
}
