import { BlockInput } from '../../../../../../src/devcomp/domain/models/block/BlockInput.js';
import { BlockSelect } from '../../../../../../src/devcomp/domain/models/block/BlockSelect.js';
import { BlockSelectOption } from '../../../../../../src/devcomp/domain/models/block/BlockSelectOption.js';
import { BlockText } from '../../../../../../src/devcomp/domain/models/block/BlockText.js';
import { ComponentElement } from '../../../../../../src/devcomp/domain/models/component/ComponentElement.js';
import { ComponentStepper } from '../../../../../../src/devcomp/domain/models/component/ComponentStepper.js';
import { Download } from '../../../../../../src/devcomp/domain/models/element/Download.js';
import { Embed } from '../../../../../../src/devcomp/domain/models/element/Embed.js';
import { Card } from '../../../../../../src/devcomp/domain/models/element/flashcards/Card.js';
import { Flashcards } from '../../../../../../src/devcomp/domain/models/element/flashcards/Flashcards.js';
import { Image } from '../../../../../../src/devcomp/domain/models/element/Image.js';
import { QCM } from '../../../../../../src/devcomp/domain/models/element/QCM.js';
import { QCU } from '../../../../../../src/devcomp/domain/models/element/QCU.js';
import { QCUDeclarative } from '../../../../../../src/devcomp/domain/models/element/QCU-declarative.js';
import { QROCM } from '../../../../../../src/devcomp/domain/models/element/QROCM.js';
import { Separator } from '../../../../../../src/devcomp/domain/models/element/Separator.js';
import { Text } from '../../../../../../src/devcomp/domain/models/element/Text.js';
import { Video } from '../../../../../../src/devcomp/domain/models/element/Video.js';
import { Module } from '../../../../../../src/devcomp/domain/models/module/Module.js';
import { moduleSerializer } from '../../../../../../src/devcomp/infrastructure/serializers/jsonapi/module-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | DevComp | Infrastructure | Serializers | Jsonapi | ModuleSerializer', function () {
  describe('#serialize', function () {
    it('should serialize with redirectionUrl', function () {
      // given
      const id = 'id';
      const shortId = 'glzovn7d';
      const slug = 'bien-ecrire-son-adresse-mail';
      const title = 'Bien écrire son adresse mail';
      const redirectionUrl = 'https://app.pix.fr/parcours/COMBINIX1';
      const isBeta = true;
      const version = Symbol('version');
      const visibility = Symbol('visibility');
      const details = {
        image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
        description:
          'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
        duration: 12,
        level: 'novice',
        objectives: [
          'Écrire une adresse mail correctement, en évitant les erreurs courantes',
          'Connaître les parties d’une adresse mail et les identifier sur des exemples',
          'Comprendre les fonctions des parties d’une adresse mail',
        ],
      };
      const moduleFromDomain = new Module({
        id,
        shortId,
        details,
        slug,
        title,
        sections: [],
        isBeta,
        version,
        visibility,
        glossary: [],
      });
      moduleFromDomain.setRedirectionUrl(redirectionUrl);
      const expectedJson = {
        data: {
          type: 'modules',
          id,
          attributes: {
            'redirection-url': redirectionUrl,
            'short-id': shortId,
            slug,
            title,
            'is-beta': isBeta,
            details,
            version,
            glossary: [],
          },
          relationships: {
            sections: {
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

    it('should serialize with empty sections list', function () {
      // given
      const id = 'id';
      const shortId = 'glzovn7d';
      const slug = 'bien-ecrire-son-adresse-mail';
      const title = 'Bien écrire son adresse mail';
      const isBeta = true;
      const version = Symbol('version');
      const visibility = Symbol('visibility');
      const details = {
        image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
        description:
          'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
        duration: 12,
        level: 'novice',
        objectives: [
          'Écrire une adresse mail correctement, en évitant les erreurs courantes',
          'Connaître les parties d’une adresse mail et les identifier sur des exemples',
          'Comprendre les fonctions des parties d’une adresse mail',
        ],
      };
      const moduleFromDomain = new Module({
        id,
        shortId,
        details,
        slug,
        title,
        sections: [],
        isBeta,
        version,
        visibility,
        glossary: [],
      });
      const expectedJson = {
        data: {
          type: 'modules',
          id,
          attributes: {
            'short-id': shortId,
            slug,
            title,
            'is-beta': isBeta,
            details,
            version,
            glossary: [],
          },
          relationships: {
            sections: {
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

    it('should serialize with empty grains list', function () {
      // given
      const id = 'id';
      const shortId = 'glzovn7d';
      const slug = 'bien-ecrire-son-adresse-mail';
      const title = 'Bien écrire son adresse mail';
      const isBeta = true;
      const version = Symbol('version');
      const visibility = Symbol('visibility');
      const details = {
        image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
        description:
          'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
        duration: 12,
        level: 'novice',
        objectives: [
          'Écrire une adresse mail correctement, en évitant les erreurs courantes',
          'Connaître les parties d’une adresse mail et les identifier sur des exemples',
          'Comprendre les fonctions des parties d’une adresse mail',
        ],
      };
      const moduleFromDomain = new Module({
        id,
        shortId,
        details,
        slug,
        title,
        sections: [{ id: 'section1', type: 'none', grains: [] }],
        isBeta,
        version,
        visibility,
        glossary: [],
      });
      const expectedJson = {
        data: {
          type: 'modules',
          id,
          attributes: {
            'short-id': shortId,
            slug,
            title,
            'is-beta': isBeta,
            details,
            version,
            glossary: [],
          },
          relationships: {
            sections: {
              data: [
                {
                  id: 'section1',
                  type: 'sections',
                },
              ],
            },
          },
        },
        included: [
          {
            attributes: {
              grains: [],
              type: 'none',
            },
            id: 'section1',
            type: 'sections',
          },
        ],
      };

      // when
      const json = moduleSerializer.serialize(moduleFromDomain);

      // then
      expect(json).to.deep.equal(expectedJson);
    });

    it('should serialize with grains list of components', function () {
      // given
      const id = 'id';
      const shortId = 'glzovn7d';
      const slug = 'bien-ecrire-son-adresse-mail';
      const title = 'Bien écrire son adresse mail';
      const isBeta = true;
      const version = Symbol('version');
      const visibility = Symbol('visibility');
      const details = {
        image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
        description:
          'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
        duration: 12,
        level: 'novice',
        objectives: [
          'Écrire une adresse mail correctement, en évitant les erreurs courantes',
          'Connaître les parties d’une adresse mail et les identifier sur des exemples',
          'Comprendre les fonctions des parties d’une adresse mail',
        ],
      };
      const moduleFromDomain = new Module({
        id,
        shortId,
        slug,
        title,
        isBeta,
        version,
        details,
        visibility,
        sections: [
          {
            id: 'section1',
            type: 'none',
            grains: [
              {
                id: '1',
                title: 'Grain 1',
                type: 'activity',
                components: getComponents(),
              },
            ],
          },
        ],
        glossary: [],
      });

      // when
      const json = moduleSerializer.serialize(moduleFromDomain);

      // then
      const expectedJson = {
        data: {
          attributes: {
            'short-id': shortId,
            slug,
            title: 'Bien écrire son adresse mail',
            'is-beta': isBeta,
            version,
            details,
            glossary: [],
          },
          id: 'id',
          relationships: {
            sections: {
              data: [
                {
                  id: 'section1',
                  type: 'sections',
                },
              ],
            },
          },
          type: 'modules',
        },
        included: [
          {
            attributes: {
              type: 'none',
              grains: [
                {
                  id: '1',
                  title: 'Grain 1',
                  components: getAttributesComponents(),
                  type: 'activity',
                },
              ],
            },
            id: 'section1',
            type: 'sections',
          },
        ],
      };
      expect(json).to.deep.equal(expectedJson);
    });
  });
});

function getComponents() {
  const qrocmElement = new QROCM({
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
        tolerances: [],
        solutions: ['naomizao@yahoo.com', 'naomizao@yahoo.fr'],
      }),
      new BlockSelect({
        input: 'seconde-partie',
        display: 'inline',
        placeholder: '',
        ariaLabel: 'Réponse 3',
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
    feedbacks: { valid: { state: 'valid' }, invalid: { state: 'invalid' } },
  });
  return [
    new ComponentStepper({
      instruction: '',
      steps: [
        {
          elements: [qrocmElement],
        },
      ],
    }),
    new ComponentElement({ element: new Text({ id: '1', content: 'toto', tag: ' ' }) }),
    new ComponentElement({
      element: new QCU({
        id: '2',
        proposals: [{ id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'toto', feedback: 'Bonne réponse !' }],
        instruction: 'hello',
        solution: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
      }),
    }),
    new ComponentElement({
      element: new QCUDeclarative({
        id: 'af447a7b-6790-4b3b-b83e-296e6618ca31',
        proposals: [
          {
            id: '1',
            content: 'plop',
            feedback: {
              diagnosis: 'blabla',
            },
          },
          {
            id: '2',
            content: 'bam',
            feedback: {
              diagnosis: 'blabla',
            },
          },
        ],
        instruction: 'question declarative',
      }),
    }),
    new ComponentElement({
      element: new QCM({
        id: '2000',
        proposals: [
          { id: '1', content: 'toto' },
          { id: '2', content: 'tata' },
          { id: '3', content: 'titi' },
        ],
        instruction: 'hello',
        feedbacks: { valid: { state: 'valid' }, invalid: { state: 'invalid' } },
        solutions: ['1', '2'],
      }),
    }),
    new ComponentElement({
      element: qrocmElement,
    }),
    new ComponentElement({
      element: new Image({
        id: '3',
        url: 'https://assets.pix.org/modules/placeholder-details.svg',
        alt: 'alt',
        alternativeText: 'alternativeText',
        licence: 'mon copyright',
        legend: 'ma légende',
        infos: { width: 400, height: 200 },
      }),
    }),
    new ComponentElement({
      element: new Embed({
        id: '3',
        url: 'url',
        height: 400,
        title: 'title',
        instruction: '<p>instruction</p>',
        isCompletionRequired: false,
      }),
    }),
    new ComponentElement({
      element: new Video({
        id: '4',
        title: 'title',
        url: 'https://assets.pix.org/modules/mavideo.mp4',
        subtitles: 'https://assets.pix.org/modules/mavideo.vtt',
        poster: 'https://assets.pix.org/modules/mavideo.jpg',
        transcription: 'transcription',
      }),
    }),
    new ComponentElement({
      element: new Download({
        id: '5',
        files: [{ format: '.pdf', url: 'https://example.net/file.pdf' }],
      }),
    }),
    new ComponentElement({
      element: new Separator({
        id: '6',
      }),
    }),
    new ComponentElement({
      element: new Flashcards({
        id: '7',
        title: 'title',
        instruction: 'instruction',
        introImage: {
          url: 'https://...',
        },
        cards: [
          new Card({
            id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
            recto: {
              image: {
                url: 'https://...',
                information: {
                  height: 333,
                  width: 333,
                  type: 'vector',
                },
              },
            },
            verso: {
              image: {
                url: 'https://...',
                information: {
                  height: 333,
                  width: 333,
                  type: 'vector',
                },
              },
            },
          }),
        ],
      }),
    }),
  ];
}

function getAttributesComponents() {
  const expectedQrocm = {
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
    feedbacks: {
      invalid: {
        state: 'invalid',
      },
      valid: {
        state: 'valid',
      },
    },
    type: 'qrocm',
  };
  return [
    {
      type: 'stepper',
      instruction: '',
      steps: [
        {
          elements: [expectedQrocm],
        },
      ],
    },
    {
      type: 'element',
      element: {
        content: 'toto',
        id: '1',
        isAnswerable: false,
        type: 'text',
        tag: ' ',
      },
    },
    {
      type: 'element',
      element: {
        id: '2',
        instruction: 'hello',
        isAnswerable: true,
        locales: undefined,
        hasShortProposals: false,
        proposals: [
          {
            content: 'toto',
            id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
            feedback: 'Bonne réponse !',
          },
        ],
        type: 'qcu',
        solution: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
      },
    },
    {
      type: 'element',
      element: {
        id: 'af447a7b-6790-4b3b-b83e-296e6618ca31',
        instruction: 'question declarative',
        isAnswerable: true,
        hasShortProposals: false,
        proposals: [
          {
            content: 'plop',
            id: '1',
            feedback: {
              diagnosis: 'blabla',
            },
          },
          {
            content: 'bam',
            id: '2',
            feedback: {
              diagnosis: 'blabla',
            },
          },
        ],
        type: 'qcu-declarative',
      },
    },
    {
      type: 'element',
      element: {
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
        feedbacks: { valid: { state: 'valid' }, invalid: { state: 'invalid' } },
        solutions: ['1', '2'],
        hasShortProposals: false,
        type: 'qcm',
      },
    },
    {
      type: 'element',
      element: expectedQrocm,
    },
    {
      type: 'element',
      element: {
        alt: 'alt',
        alternativeText: 'alternativeText',
        id: '3',
        isAnswerable: false,
        type: 'image',
        url: 'https://assets.pix.org/modules/placeholder-details.svg',
        legend: 'ma légende',
        licence: 'mon copyright',
        infos: {
          width: 400,
          height: 200,
        },
      },
    },
    {
      type: 'element',
      element: {
        height: 400,
        title: 'title',
        id: '3',
        isAnswerable: false,
        isCompletionRequired: false,
        type: 'embed',
        url: 'url',
        instruction: '<p>instruction</p>',
      },
    },
    {
      type: 'element',
      element: {
        id: '4',
        isAnswerable: false,
        poster: 'https://assets.pix.org/modules/mavideo.jpg',
        subtitles: 'https://assets.pix.org/modules/mavideo.vtt',
        title: 'title',
        transcription: 'transcription',
        type: 'video',
        url: 'https://assets.pix.org/modules/mavideo.mp4',
      },
    },
    {
      type: 'element',
      element: {
        id: '5',
        isAnswerable: false,
        files: [{ format: '.pdf', url: 'https://example.net/file.pdf' }],
        type: 'download',
      },
    },
    {
      type: 'element',
      element: {
        id: '6',
        isAnswerable: false,
        type: 'separator',
      },
    },
    {
      type: 'element',
      element: {
        id: '7',
        isAnswerable: true,
        title: 'title',
        instruction: 'instruction',
        introImage: {
          url: 'https://...',
        },
        type: 'flashcards',
        cards: [
          {
            id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
            recto: {
              image: {
                url: 'https://...',
                information: {
                  height: 333,
                  width: 333,
                  type: 'vector',
                },
              },
            },
            verso: {
              image: {
                url: 'https://...',
                information: {
                  height: 333,
                  width: 333,
                  type: 'vector',
                },
              },
            },
          },
        ],
      },
    },
  ];
}
