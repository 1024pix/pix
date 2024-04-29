import { BlockInput } from '../../../../src/devcomp/domain/models/block/BlockInput.js';
import { BlockSelect } from '../../../../src/devcomp/domain/models/block/BlockSelect.js';
import { BlockText } from '../../../../src/devcomp/domain/models/block/BlockText.js';
import { Image } from '../../../../src/devcomp/domain/models/element/Image.js';
import { QCM } from '../../../../src/devcomp/domain/models/element/QCM.js';
import { QCMForAnswerVerification } from '../../../../src/devcomp/domain/models/element/QCM-for-answer-verification.js';
import { QCU } from '../../../../src/devcomp/domain/models/element/QCU.js';
import { QCUForAnswerVerification } from '../../../../src/devcomp/domain/models/element/QCU-for-answer-verification.js';
import { QROCM } from '../../../../src/devcomp/domain/models/element/QROCM.js';
import { QROCMForAnswerVerification } from '../../../../src/devcomp/domain/models/element/QROCM-for-answer-verification.js';
import { Text } from '../../../../src/devcomp/domain/models/element/Text.js';
import { Video } from '../../../../src/devcomp/domain/models/element/Video.js';
import { Grain } from '../../../../src/devcomp/domain/models/Grain.js';
import { Module } from '../../../../src/devcomp/domain/models/module/Module.js';
import { TransitionText } from '../../../../src/devcomp/domain/models/TransitionText.js';
import moduleDatasource from '../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import * as moduleRepository from '../../../../src/devcomp/infrastructure/repositories/module-repository.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';

describe('Integration | DevComp | Repositories | ModuleRepository', function () {
  describe('#getBySlug', function () {
    it('should throw a NotFoundError if the module does not exist', async function () {
      // given
      const nonExistingModuleSlug = 'dresser-des-pokemons';

      // when
      const error = await catchErr(moduleRepository.getBySlug)({ slug: nonExistingModuleSlug, moduleDatasource });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should throw a Error if the module instanciation throw an error', async function () {
      // given
      const moduleSlug = 'incomplete-module';
      const moduleDatasourceStub = {
        getBySlug: async () => {
          return {
            id: 1,
            slug: moduleSlug,
          };
        },
      };

      // when
      const error = await catchErr(moduleRepository.getBySlug)({
        slug: moduleSlug,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(error).not.to.be.instanceOf(NotFoundError);
    });

    it('should return a module with grains if it exists', async function () {
      // given
      const existingModuleSlug = 'didacticiel-modulix';

      // when
      const module = await moduleRepository.getBySlug({
        slug: existingModuleSlug,
        moduleDatasource,
      });

      // then
      expect(module).to.be.instanceOf(Module);
      expect(module.grains.every((grain) => grain instanceof Grain)).to.be.true;
    });

    it('should return a module with transition texts if it exists', async function () {
      // given
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';

      // when
      const module = await moduleRepository.getBySlug({
        slug: existingModuleSlug,
        moduleDatasource,
      });

      // then
      expect(module.transitionTexts.every((transitionText) => transitionText instanceof TransitionText)).to.be.true;
    });

    it('should return a module which contains elements of type Text if it exists', async function () {
      // given
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        details: {
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
        },
        grains: [
          {
            id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
            type: 'lesson',
            title: 'Explications : les parties d’une adresse mail',
            elements: [
              {
                id: 'd9e8a7b6-5c4d-3e2f-1a0b-9f8e7d6c5b4a',
                type: 'text',
                content:
                  "<h3 class='screen-reader-only'>L'arobase</h3><p>L’arobase est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p><span aria-hidden='true'>🇬🇧</span> En anglais, ce symbole se lit <i lang='en'>“at”</i> qui veut dire “chez”.</p><p><span aria-hidden='true'>🤔</span> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>",
              },
            ],
          },
        ],
      };
      const moduleDatasourceStub = {
        getBySlug: sinon.stub(),
      };
      moduleDatasourceStub.getBySlug.withArgs(existingModuleSlug).resolves(expectedFoundModule);

      // when
      const module = await moduleRepository.getBySlug({
        slug: existingModuleSlug,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(module.grains[0].elements).to.have.lengthOf(1);
      expect(module.grains[0].elements[0]).to.be.instanceOf(Text);
    });

    it('should return a module which contains elements of type QCU if it exists', async function () {
      // given
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        details: {
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
        },
        grains: [
          {
            id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
            type: 'lesson',
            title: 'Explications : les parties d’une adresse mail',
            elements: [
              {
                id: 'ba78dead-a806-4954-b408-e8ef28d28fab',
                type: 'qcu',
                instruction: '<p>L’adresse mail M3g4Cool1415@gmail.com est correctement écrite ?</p>',
                proposals: [
                  {
                    id: '6d4db7f8-b783-473d-a1cc-73dac8411855',
                    content: 'Vrai',
                  },
                  {
                    id: '26d27fa3-3269-4d78-916c-3aa066976592',
                    content: 'Faux',
                  },
                ],
                feedbacks: {
                  valid:
                    '<p>On peut avoir des chiffres n’importe où dans l’identifiant. On peut aussi utiliser des majuscules.</p>',
                  invalid:
                    '<p>On peut avoir des chiffres n’importe où dans l’identifiant. On peut aussi utiliser des majuscules.</p>',
                },
                solution: '6d4db7f8-b783-473d-a1cc-73dac8411855',
              },
            ],
          },
        ],
      };
      const moduleDatasourceStub = {
        getBySlug: sinon.stub(),
      };
      moduleDatasourceStub.getBySlug.withArgs(existingModuleSlug).resolves(expectedFoundModule);

      // when
      const module = await moduleRepository.getBySlug({
        slug: existingModuleSlug,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(module.grains[0].elements).to.have.lengthOf(1);
      expect(module.grains[0].elements[0]).to.be.instanceOf(QCU);
    });

    it('should return a module which contains elements of type QCM if it exists', async function () {
      // given
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        details: {
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
        },
        grains: [
          {
            id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
            type: 'lesson',
            title: 'Explications : les parties d’une adresse mail',
            elements: [
              {
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
              },
            ],
          },
        ],
      };
      const moduleDatasourceStub = {
        getBySlug: sinon.stub(),
      };
      moduleDatasourceStub.getBySlug.withArgs(existingModuleSlug).resolves(expectedFoundModule);

      // when
      const module = await moduleRepository.getBySlug({
        slug: existingModuleSlug,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(module.grains[0].elements).to.have.lengthOf(1);
      expect(module.grains[0].elements[0]).to.be.instanceOf(QCM);
    });

    it('should return a module which contains elements of type Image if it exists', async function () {
      // given
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        details: {
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
        },
        grains: [
          {
            id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
            type: 'lesson',
            title: 'Explications : les parties d’une adresse mail',
            elements: [
              {
                id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
                type: 'image',
                url: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
                alt: 'missing alt',
                alternativeText: 'missing alternative instructions',
              },
            ],
          },
        ],
      };
      const moduleDatasourceStub = {
        getBySlug: sinon.stub(),
      };
      moduleDatasourceStub.getBySlug.withArgs(existingModuleSlug).resolves(expectedFoundModule);

      // when
      const module = await moduleRepository.getBySlug({
        slug: existingModuleSlug,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(module.grains[0].elements).to.have.lengthOf(1);
      expect(module.grains[0].elements[0]).to.be.instanceOf(Image);
    });

    it('should return a module which contains elements of type Video if it exists', async function () {
      // given
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        details: {
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
        },
        grains: [
          {
            id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
            type: 'lesson',
            title: 'Explications : les parties d’une adresse mail',
            elements: [
              {
                id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
                type: 'video',
                title: 'Le format des adress mail',
                url: 'https://videos.pix.fr/modulix/chat_animation_2.webm',
                subtitles: 'Insert subtitles here',
                transcription: 'Insert transcription here',
              },
            ],
          },
        ],
      };
      const moduleDatasourceStub = {
        getBySlug: sinon.stub(),
      };
      moduleDatasourceStub.getBySlug.withArgs(existingModuleSlug).resolves(expectedFoundModule);

      // when
      const module = await moduleRepository.getBySlug({
        slug: existingModuleSlug,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(module.grains[0].elements).to.have.lengthOf(1);
      expect(module.grains[0].elements[0]).to.be.instanceOf(Video);
    });

    it('should return a module which contains elements of type QROCM if it exists', async function () {
      // given
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        details: {
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
        },
        grains: [
          {
            id: 'b7ea7630-824a-4a49-83d1-abb9b8d0d120',
            type: 'activity',
            title: 'Écrire une adresse mail correctement',
            elements: [
              {
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
              },
            ],
          },
        ],
      };
      const moduleDatasourceStub = {
        getBySlug: sinon.stub(),
      };
      moduleDatasourceStub.getBySlug.withArgs(existingModuleSlug).resolves(expectedFoundModule);

      const BLOCK_TEXT_INDEX = 0;
      const BLOCK_INPUT_INDEX = 1;
      const BLOCK_SELECT_INDEX = 2;

      // when
      const module = await moduleRepository.getBySlug({
        slug: existingModuleSlug,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(module.grains[0].elements).to.have.lengthOf(1);
      expect(module.grains[0].elements[0]).to.be.instanceOf(QROCM);
      expect(module.grains[0].elements[0].proposals[BLOCK_TEXT_INDEX]).to.be.instanceOf(BlockText);
      expect(module.grains[0].elements[0].proposals[BLOCK_INPUT_INDEX]).to.be.instanceOf(BlockInput);
      expect(module.grains[0].elements[0].proposals[BLOCK_SELECT_INDEX]).to.be.instanceOf(BlockSelect);
    });

    it('should log a warning if none of the element types match and return an empty element', async function () {
      // given
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        details: {
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
        },
        grains: [
          {
            id: 'b7ea7630-824a-4a49-83d1-abb9b8d0d120',
            type: 'activity',
            title: 'Écrire une adresse mail correctement',
            elements: [
              {
                id: '98c51fa7-03b7-49b1-8c5e-49341d35909c',
                type: 'TOTO',
                instruction:
                  "<p>Pour être sûr que tout est clair, complétez le texte ci-dessous <span aria-hidden='true'>🧩</span></p><p>Si vous avez besoin d’aide, revenez en arrière <span aria-hidden='true'>⬆️</span></p>",
                proposals: [''],
                feedbacks: {
                  valid: '<p>Bravo ! 🎉 </p>',
                  invalid: "<p class='pix-list-inline'>Et non !</p>",
                },
              },
            ],
          },
        ],
      };
      const moduleDatasourceStub = {
        getBySlug: sinon.stub(),
      };
      moduleDatasourceStub.getBySlug.withArgs(existingModuleSlug).resolves(expectedFoundModule);

      const loggerMessage = { event: 'module_element_type_unknown', message: 'Element inconnu: TOTO' };
      sinon.stub(logger, 'warn').returns();

      // when
      const module = await moduleRepository.getBySlug({
        slug: existingModuleSlug,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(logger.warn).to.have.been.calledWithExactly(loggerMessage);
      expect(module.grains[0].elements).to.be.deep.equal([]);
    });
  });

  describe('#getBySlugForVerification', function () {
    it('should throw a NotFoundError if the module does not exist', async function () {
      // given
      const nonExistingModuleSlug = 'dresser-des-pokemons';

      // when
      const error = await catchErr(moduleRepository.getBySlugForVerification)({
        slug: nonExistingModuleSlug,
        moduleDatasource,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should throw a Error if the module instanciation throw an error', async function () {
      // given
      const moduleSlug = 'incomplete-module';
      const moduleDatasourceStub = {
        getBySlugForVerification: async () => {
          return {
            id: 1,
            slug: moduleSlug,
          };
        },
      };

      // when
      const error = await catchErr(moduleRepository.getBySlugForVerification)({
        slug: moduleSlug,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(error).not.to.be.instanceOf(NotFoundError);
    });

    it('should return a module with valid answerable elements if it exists', async function () {
      // given
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        details: {
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
        },
        grains: [
          {
            id: 'b7ea7630-824a-4a49-83d1-abb9b8d0d120',
            type: 'activity',
            title: 'Écrire une adresse mail correctement',
            elements: [
              {
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
              },
              {
                id: '0a5e77e8-1c8e-4cb6-a41d-cf6ad7935447',
                type: 'qcu',
                instruction: '<p>Remontez la page pour trouver le premier mot de ce module.<br>Quel est ce mot ?</p>',
                proposals: [
                  {
                    id: '1',
                    content: 'Bienvenue',
                  },
                  {
                    id: '2',
                    content: 'Bonjour',
                  },
                  {
                    id: '3',
                    content: 'Nous',
                  },
                ],
                feedbacks: {
                  valid: '<p>Correct ! Vous avez bien remonté la page</p>',
                  invalid: '<p>Incorrect. Remonter la page pour retrouver le premier mot !</p>',
                },
                solution: '2',
              },
              {
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
              },
            ],
          },
        ],
      };
      const moduleDatasourceStub = {
        getBySlug: sinon.stub(),
      };
      moduleDatasourceStub.getBySlug.withArgs(existingModuleSlug).resolves(expectedFoundModule);

      // when
      const module = await moduleRepository.getBySlugForVerification({
        slug: existingModuleSlug,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(module).to.be.instanceOf(Module);

      const qcus = module.grains.flatMap((grain) => grain.elements.filter((element) => element.type === 'qcu'));
      expect(qcus).to.have.length(1);
      qcus.forEach((qcu) => expect(qcu).to.be.instanceOf(QCUForAnswerVerification));

      const qrocms = module.grains.flatMap((grain) => grain.elements.filter((element) => element.type === 'qrocm'));
      expect(qrocms).to.have.length(1);
      qrocms.forEach((qrocm) => expect(qrocm).to.be.instanceOf(QROCMForAnswerVerification));

      const qcms = module.grains.flatMap((grain) => grain.elements.filter((element) => element.type === 'qcm'));
      expect(qcms).to.have.length(1);
      qcms.forEach((qcm) => expect(qcm).to.be.instanceOf(QCMForAnswerVerification));
    });

    it('should log a warning if none of the element types match and return an empty element', async function () {
      // given
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        details: {
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
        },
        grains: [
          {
            id: 'b7ea7630-824a-4a49-83d1-abb9b8d0d120',
            type: 'activity',
            title: 'Écrire une adresse mail correctement',
            elements: [
              {
                id: '98c51fa7-03b7-49b1-8c5e-49341d35909c',
                type: 'TOTO',
                instruction:
                  "<p>Pour être sûr que tout est clair, complétez le texte ci-dessous <span aria-hidden='true'>🧩</span></p><p>Si vous avez besoin d’aide, revenez en arrière <span aria-hidden='true'>⬆️</span></p>",
                proposals: [''],
                feedbacks: {
                  valid: '<p>Bravo ! 🎉 </p>',
                  invalid: "<p class='pix-list-inline'>Et non !</p>",
                },
              },
            ],
          },
        ],
      };
      const moduleDatasourceStub = {
        getBySlug: sinon.stub(),
      };
      moduleDatasourceStub.getBySlug.withArgs(existingModuleSlug).resolves(expectedFoundModule);

      const loggerMessage = {
        event: 'module_element_type_unknown',
        message: `Element inconnu: TOTO`,
      };
      sinon.stub(logger, 'warn').returns();

      // when
      const module = await moduleRepository.getBySlugForVerification({
        slug: existingModuleSlug,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(logger.warn).to.have.been.calledWithExactly(loggerMessage);
      expect(module.grains[0].elements).to.be.deep.equal([]);
    });
  });
});
