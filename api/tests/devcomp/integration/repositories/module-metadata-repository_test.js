import sinon from 'sinon';

import { ModuleDoesNotExistError } from '../../../../src/devcomp/domain/errors.js';
import { Module } from '../../../../src/devcomp/domain/models/module/Module.js';
import { ModuleMetadata } from '../../../../src/devcomp/domain/models/module/ModuleMetadata.js';
import moduleDatasource from '../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import * as moduleMetadataRepository from '../../../../src/devcomp/infrastructure/repositories/module-metadata-repository.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Integration | DevComp | Repositories | ModuleRepository', function () {
  describe('#getAllByIds', function () {
    it('should return all module with their metadata', async function () {
      // given
      const modulesIds = ['f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d', '6282925d-4775-4bca-b513-4c3009ec5886'];
      const firstModule = {
        id: modulesIds[0],
        shortId: 'gbsri73s',
        slug: 'getAllByIdsModuleSlug1',
        title: 'Bien écrire son adresse mail',
        isBeta: true,
        visibility: Module.VISIBILITY.PUBLIC,
        details: {
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          description:
            'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
          duration: 12,
          level: 'novice',
          tabletSupport: 'comfortable',
          objectives: [
            'Écrire une adresse mail correctement, en évitant les erreurs courantes',
            'Connaître les parties d’une adresse mail et les identifier sur des exemples',
            'Comprendre les fonctions des parties d’une adresse mail',
          ],
        },
        sections: [
          {
            id: '5bf1c672-3746-4480-b9ac-1f0af9c7c509',
            type: 'practise',
            grains: [
              {
                id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
                type: 'lesson',
                title: 'Explications : les parties d’une adresse mail',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: 'd9e8a7b6-5c4d-3e2f-1a0b-9f8e7d6c5b4a',
                      type: 'text',
                      content:
                        "<h4 class='screen-reader-only'>L'arobase</h4><p>L’arobase est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p><span aria-hidden='true'>🇬🇧</span> En anglais, ce symbole se lit <i lang='en'>“at”</i> qui veut dire “chez”.</p><p><span aria-hidden='true'>🤔</span> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>",
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
      const secondModule = {
        id: modulesIds[1],
        shortId: '1bdri73s',
        slug: 'getAllByIdsModuleSlug2',
        title: 'Bac à sable',
        isBeta: true,
        visibility: Module.VISIBILITY.PUBLIC,
        details: {
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          description:
            "<p>Ce module est dédié à des tests internes à Pix.</p><p>Il contient normalement l'intégralité des fonctionnalités disponibles à date.</p>",
          duration: 5,
          level: 'novice',
          tabletSupport: 'inconvenient',
          objectives: ['Non régression fonctionnelle'],
        },
        sections: [
          {
            id: 'd2ad3253-7f0a-41f5-b10e-0fa0f49d0cc7',
            type: 'practise',
            grains: [
              {
                id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
                type: 'lesson',
                title: 'Explications : les parties d’une adresse mail',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: 'd9e8a7b6-5c4d-3e2f-1a0b-9f8e7d6c5b4a',
                      type: 'text',
                      content:
                        "<h4 class='screen-reader-only'>L'arobase</h4><p>L’arobase est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p><span aria-hidden='true'>🇬🇧</span> En anglais, ce symbole se lit <i lang='en'>“at”</i> qui veut dire “chez”.</p><p><span aria-hidden='true'>🤔</span> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>",
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const moduleDatasourceStub = {
        getAllByIds: sinon.stub(),
      };
      moduleDatasourceStub.getAllByIds.withArgs(modulesIds).resolves([firstModule, secondModule]);

      // when
      const modules = await moduleMetadataRepository.getAllByIds({
        ids: modulesIds,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      const expectedResult = [
        new ModuleMetadata({
          id: firstModule.id,
          shortId: firstModule.shortId,
          slug: firstModule.slug,
          title: firstModule.title,
          isBeta: firstModule.isBeta,
          duration: firstModule.details.duration,
          image: firstModule.details.image,
          visibility: firstModule.visibility,
        }),
        new ModuleMetadata({
          id: secondModule.id,
          shortId: secondModule.shortId,
          slug: secondModule.slug,
          title: secondModule.title,
          isBeta: secondModule.isBeta,
          duration: secondModule.details.duration,
          image: secondModule.details.image,
          visibility: secondModule.visibility,
        }),
      ];
      expect(modules).to.have.lengthOf(2);
      expect(modules).to.deep.equal(expectedResult);
    });

    it('should throw a "NotFoundError" when a module does not exist', async function () {
      // given
      const notExistingModuleIds = ['not-existing-module-id-1', 'not-existing-module-id-2'];
      const expectedErrorMessage = `Modules with ids not found : ${notExistingModuleIds}`;
      const moduleDatasourceStub = {
        getAllByIds: sinon.stub(),
      };
      moduleDatasourceStub.getAllByIds
        .withArgs(notExistingModuleIds)
        .rejects(new ModuleDoesNotExistError(expectedErrorMessage));

      // when
      const error = await catchErr(moduleMetadataRepository.getAllByIds)({
        ids: notExistingModuleIds,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(expectedErrorMessage);
    });
  });

  describe('#getAllByShortIds', function () {
    it('should return all module with their metadata', async function () {
      // given
      const moduleShortIds = ['gbsri73s', '1bdri73s'];
      const firstModule = {
        id: moduleShortIds[0],
        shortId: 'gbsri73s',
        slug: 'getAllByIdsModuleSlug1',
        title: 'Bien écrire son adresse mail',
        isBeta: true,
        visibility: Module.VISIBILITY.PUBLIC,
        details: {
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          description:
            'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
          duration: 12,
          level: 'novice',
          tabletSupport: 'comfortable',
          objectives: [
            'Écrire une adresse mail correctement, en évitant les erreurs courantes',
            'Connaître les parties d’une adresse mail et les identifier sur des exemples',
            'Comprendre les fonctions des parties d’une adresse mail',
          ],
        },
        sections: [
          {
            id: '5bf1c672-3746-4480-b9ac-1f0af9c7c509',
            type: 'practise',
            grains: [
              {
                id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
                type: 'lesson',
                title: 'Explications : les parties d’une adresse mail',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: 'd9e8a7b6-5c4d-3e2f-1a0b-9f8e7d6c5b4a',
                      type: 'text',
                      content:
                        "<h4 class='screen-reader-only'>L'arobase</h4><p>L’arobase est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p><span aria-hidden='true'>🇬🇧</span> En anglais, ce symbole se lit <i lang='en'>“at”</i> qui veut dire “chez”.</p><p><span aria-hidden='true'>🤔</span> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>",
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
      const secondModule = {
        id: moduleShortIds[1],
        shortId: '1bdri73s',
        slug: 'getAllByIdsModuleSlug2',
        title: 'Bac à sable',
        isBeta: true,
        visibility: Module.VISIBILITY.PUBLIC,
        details: {
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          description:
            "<p>Ce module est dédié à des tests internes à Pix.</p><p>Il contient normalement l'intégralité des fonctionnalités disponibles à date.</p>",
          duration: 5,
          level: 'novice',
          tabletSupport: 'inconvenient',
          objectives: ['Non régression fonctionnelle'],
        },
        sections: [
          {
            id: 'd2ad3253-7f0a-41f5-b10e-0fa0f49d0cc7',
            type: 'practise',
            grains: [
              {
                id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
                type: 'lesson',
                title: 'Explications : les parties d’une adresse mail',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: 'd9e8a7b6-5c4d-3e2f-1a0b-9f8e7d6c5b4a',
                      type: 'text',
                      content:
                        "<h4 class='screen-reader-only'>L'arobase</h4><p>L’arobase est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p><span aria-hidden='true'>🇬🇧</span> En anglais, ce symbole se lit <i lang='en'>“at”</i> qui veut dire “chez”.</p><p><span aria-hidden='true'>🤔</span> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>",
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const moduleDatasourceStub = {
        getAllByShortIds: sinon.stub(),
      };
      moduleDatasourceStub.getAllByShortIds.withArgs(moduleShortIds).resolves([firstModule, secondModule]);

      // when
      const modules = await moduleMetadataRepository.getAllByShortIds({
        shortIds: moduleShortIds,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      const expectedResult = [
        new ModuleMetadata({
          id: firstModule.id,
          shortId: firstModule.shortId,
          slug: firstModule.slug,
          title: firstModule.title,
          isBeta: firstModule.isBeta,
          duration: firstModule.details.duration,
          image: firstModule.details.image,
          visibility: firstModule.visibility,
        }),
        new ModuleMetadata({
          id: secondModule.id,
          shortId: secondModule.shortId,
          slug: secondModule.slug,
          title: secondModule.title,
          isBeta: secondModule.isBeta,
          duration: secondModule.details.duration,
          image: secondModule.details.image,
          visibility: secondModule.visibility,
        }),
      ];
      expect(modules).to.have.lengthOf(2);
      expect(modules).to.deep.equal(expectedResult);
    });

    it('should throw a "NotFoundError" when a module does not exist', async function () {
      // given
      const notExistingModuleShortIds = ['not-existing-module-short-id-1', 'not-existing-module-short-id-2'];
      const expectedErrorMessage = `Modules with ids not found : ${notExistingModuleShortIds}`;
      const moduleDatasourceStub = {
        getAllByShortIds: sinon.stub(),
      };
      moduleDatasourceStub.getAllByShortIds
        .withArgs(notExistingModuleShortIds)
        .rejects(new ModuleDoesNotExistError(expectedErrorMessage));

      // when
      const error = await catchErr(moduleMetadataRepository.getAllByShortIds)({
        shortIds: notExistingModuleShortIds,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(expectedErrorMessage);
    });
  });

  describe('getByShortId', function () {
    it('should return a module with its metadata', async function () {
      const existingModuleShortId = 'gbsri73s';
      const stubModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        shortId: existingModuleShortId,
        slug: 'slug',
        title: 'Bien écrire son adresse mail',
        isBeta: true,
        visibility: Module.VISIBILITY.PUBLIC,
        details: {
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          description:
            'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
          duration: 12,
          level: 'novice',
          tabletSupport: 'comfortable',
          objectives: [
            'Écrire une adresse mail correctement, en évitant les erreurs courantes',
            'Connaître les parties d’une adresse mail et les identifier sur des exemples',
            'Comprendre les fonctions des parties d’une adresse mail',
          ],
        },
        sections: [
          {
            id: '5bf1c672-3746-4480-b9ac-1f0af9c7c509',
            type: 'practise',
            grains: [
              {
                id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
                type: 'lesson',
                title: 'Explications : les parties d’une adresse mail',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: 'd9e8a7b6-5c4d-3e2f-1a0b-9f8e7d6c5b4a',
                      type: 'text',
                      content:
                        "<h4 class='screen-reader-only'>L'arobase</h4><p>L’arobase est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p><span aria-hidden='true'>🇬🇧</span> En anglais, ce symbole se lit <i lang='en'>“at”</i> qui veut dire “chez”.</p><p><span aria-hidden='true'>🤔</span> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>",
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const moduleDatasourceStub = {
        getByShortId: sinon.stub(),
      };
      moduleDatasourceStub.getByShortId.withArgs(existingModuleShortId).resolves(stubModule);

      // when
      const moduleMetadata = await moduleMetadataRepository.getByShortId({
        shortId: existingModuleShortId,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      const expectedModuleMetadata = new ModuleMetadata({
        id: stubModule.id,
        shortId: existingModuleShortId,
        slug: stubModule.slug,
        title: stubModule.title,
        isBeta: stubModule.isBeta,
        duration: stubModule.details.duration,
        image: stubModule.details.image,
        visibility: stubModule.visibility,
      });

      expect(moduleMetadata).to.be.instanceOf(ModuleMetadata);
      expect(moduleMetadata).to.deep.equal(expectedModuleMetadata);
    });

    it('should throw a NotFoundError if the module does not exist', async function () {
      // given
      const nonExistingShortId = 'not-existing-module-short-id';

      // when
      const error = await catchErr(moduleMetadataRepository.getByShortId)({
        slug: nonExistingShortId,
        moduleDatasource,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#getBySlug', function () {
    it('should return a module with its metadata', async function () {
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const stubModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        shortId: 'gbsri73s',
        slug: existingModuleSlug,
        title: 'Bien écrire son adresse mail',
        isBeta: true,
        visibility: Module.VISIBILITY.PUBLIC,
        details: {
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          description:
            'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
          duration: 12,
          level: 'novice',
          tabletSupport: 'comfortable',
          objectives: [
            'Écrire une adresse mail correctement, en évitant les erreurs courantes',
            'Connaître les parties d’une adresse mail et les identifier sur des exemples',
            'Comprendre les fonctions des parties d’une adresse mail',
          ],
        },
        sections: [
          {
            id: '5bf1c672-3746-4480-b9ac-1f0af9c7c509',
            type: 'practise',
            grains: [
              {
                id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
                type: 'lesson',
                title: 'Explications : les parties d’une adresse mail',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: 'd9e8a7b6-5c4d-3e2f-1a0b-9f8e7d6c5b4a',
                      type: 'text',
                      content:
                        "<h4 class='screen-reader-only'>L'arobase</h4><p>L’arobase est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p><span aria-hidden='true'>🇬🇧</span> En anglais, ce symbole se lit <i lang='en'>“at”</i> qui veut dire “chez”.</p><p><span aria-hidden='true'>🤔</span> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>",
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const moduleDatasourceStub = {
        getBySlug: sinon.stub(),
      };
      moduleDatasourceStub.getBySlug.withArgs(existingModuleSlug).resolves(stubModule);

      // when
      const moduleMetadata = await moduleMetadataRepository.getBySlug({
        slug: existingModuleSlug,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      const expectedModuleMetadata = new ModuleMetadata({
        id: stubModule.id,
        shortId: stubModule.shortId,
        slug: existingModuleSlug,
        title: stubModule.title,
        isBeta: stubModule.isBeta,
        duration: stubModule.details.duration,
        image: stubModule.details.image,
        visibility: stubModule.visibility,
      });

      expect(moduleMetadata).to.be.instanceOf(ModuleMetadata);
      expect(moduleMetadata).to.deep.equal(expectedModuleMetadata);
    });

    it('should throw a NotFoundError if the module does not exist', async function () {
      // given
      const nonExistingModuleSlug = 'not-existing-module-slug';

      // when
      const error = await catchErr(moduleMetadataRepository.getBySlug)({
        slug: nonExistingModuleSlug,
        moduleDatasource,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#listPublic', function () {
    it('should return a list of modules metadata', async function () {
      const emailModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        shortId: 'gbsri73s',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        isBeta: true,
        visibility: Module.VISIBILITY.PUBLIC,
        details: {
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          description:
            'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
          duration: 12,
          level: 'novice',
          tabletSupport: 'comfortable',
          objectives: [
            'Écrire une adresse mail correctement, en évitant les erreurs courantes',
            'Connaître les parties d’une adresse mail et les identifier sur des exemples',
            'Comprendre les fonctions des parties d’une adresse mail',
          ],
        },
        sections: [
          {
            id: '5bf1c672-3746-4480-b9ac-1f0af9c7c509',
            type: 'practise',
            grains: [
              {
                id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
                type: 'lesson',
                title: 'Explications : les parties d’une adresse mail',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: 'd9e8a7b6-5c4d-3e2f-1a0b-9f8e7d6c5b4a',
                      type: 'text',
                      content:
                        "<h4 class='screen-reader-only'>L'arobase</h4><p>L’arobase est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p><span aria-hidden='true'>🇬🇧</span> En anglais, ce symbole se lit <i lang='en'>“at”</i> qui veut dire “chez”.</p><p><span aria-hidden='true'>🤔</span> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>",
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
      const bacASableModule = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        shortId: '6a68bf32',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        isBeta: true,
        visibility: Module.VISIBILITY.PUBLIC,
        details: {
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          description:
            "<p>Ce module est dédié à des tests internes à Pix.</p><p>Il contient normalement l'intégralité des fonctionnalités disponibles à date.</p>",
          duration: 5,
          level: 'novice',
          tabletSupport: 'inconvenient',
          objectives: ['Non régression fonctionnelle'],
        },
        sections: [
          {
            id: 'cfaefec9-e185-43b8-8258-e8beff6dd56b',
            type: 'question-yourself',
            grains: [
              {
                id: '533c69b8-a836-41be-8ffc-8d4636e31224',
                type: 'activity',
                title: 'Voici un vrai-faux',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: '96e29215-3610-4bc6-b4a6-026bf13276b8',
                      type: 'short-video',
                      title: 'Exemple de vidéo courte',
                      url: 'https://assets.pix.org/modules/bac-a-sable/clic-droit.mp4',
                      transcription: 'Je clique avec le bouton droit de la souris.',
                    },
                  },
                  {
                    type: 'stepper',
                    steps: [
                      {
                        elements: [
                          {
                            id: '71de6394-ff88-4de3-8834-a40057a50ff4',
                            type: 'qcu',
                            instruction: '<p>Pix évalue 16 compétences numériques différentes.</p>',
                            proposals: [
                              {
                                id: '1',
                                content: 'Vrai',
                                feedback: {
                                  state: 'Correct&#8239;!',
                                  diagnosis: '<p> Ces 16 compétences sont rangées dans 5 domaines.</p>',
                                },
                              },
                              {
                                id: '2',
                                content: 'Faux',
                                feedback: {
                                  state: 'Incorrect.',
                                  diagnosis:
                                    '<p> Retourner voir la vidéo si besoin&nbsp;<span aria-hidden="true">👆</span>!</p>',
                                },
                              },
                            ],
                            solution: '1',
                          },
                        ],
                      },
                      {
                        elements: [
                          {
                            id: '0f8eb663-be85-4cb1-9168-e5c39f4ec1bd',
                            type: 'qrocm',
                            instruction: '<p>Compléter le texte suivant :</p>',
                            proposals: [
                              {
                                type: 'text',
                                content: '<span>Pix est un</span>',
                              },
                              {
                                input: 'pix-name',
                                type: 'input',
                                inputType: 'text',
                                size: 10,
                                display: 'inline',
                                placeholder: '',
                                ariaLabel: 'Mot à trouver',
                                defaultValue: '',
                                tolerances: ['t1', 't3'],
                                solutions: ['Groupement'],
                              },
                              {
                                type: 'text',
                                content: "<span>d'intérêt public qui a été créée en</span>",
                              },
                              {
                                input: 'pix-birth',
                                type: 'input',
                                inputType: 'number',
                                size: 10,
                                display: 'inline',
                                placeholder: '',
                                ariaLabel: 'Année à trouver',
                                defaultValue: '',
                                tolerances: [],
                                solutions: [2016],
                              },
                            ],
                            feedbacks: {
                              valid: {
                                state: 'Correct&#8239;!',
                                diagnosis:
                                  '<p> vous nous connaissez bien &nbsp; <span aria-hidden="true">🎉</span></p>',
                              },
                              invalid: {
                                state: 'Incorrect&#8239;!',
                                diagnosis: '<p> vous y arriverez la prochaine fois&#8239;!</p>',
                              },
                            },
                          },
                        ],
                      },
                      {
                        elements: [
                          {
                            id: '79dc17f9-142b-4e19-bcbe-bfde4e170d3f',
                            type: 'qcu-declarative',
                            instruction: '<p>Pix est découpé en 6 domaines.</p>',
                            proposals: [
                              {
                                id: '1',
                                content: 'Vrai',
                                feedback: {
                                  diagnosis: '<p> Et non ! Il y a seulement 5 domaines sur Pix.</p>',
                                },
                              },
                              {
                                id: '2',
                                content: 'Faux',
                                feedback: {
                                  diagnosis: '<p> Bien vu !</p>',
                                },
                              },
                            ],
                          },
                        ],
                      },
                      {
                        elements: [
                          {
                            id: 'ef18ed04-9551-4cee-9648-9f14a28aab1b',
                            type: 'qcm',
                            instruction: '<p>Quels sont les 3 piliers de Pix&#8239;?</p>',
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
                              valid: {
                                state: 'Correct&#8239;!',
                                diagnosis: '<p>Vous nous avez bien cernés&nbsp;:)</p>',
                              },
                              invalid: {
                                state: 'Et non&#8239;!',
                                diagnosis:
                                  '<p> Pix sert à évaluer, certifier et développer ses compétences numériques.</p>',
                              },
                            },
                            solutions: ['1', '3', '4'],
                          },
                        ],
                      },
                      {
                        elements: [
                          {
                            id: '7fb4c1c6-46f8-49a4-9547-f9febf545447',
                            type: 'text',
                            content: '<p>Voici des photographies de chiens et de bagels.</p>',
                          },
                          {
                            id: '5c25213f-14ec-4107-a1cf-ab1b97271476',
                            type: 'image',
                            url: 'https://assets.pix.org/modules/bac-a-sable/des-chiens-et-des-bagels.jpg',
                            alt: 'Une photo comportant des chiens et des bagels',
                            alternativeText: '',
                            legend: '',
                            licence: '',
                          },
                        ],
                      },
                      {
                        elements: [
                          {
                            id: 'b1ef75c8-714b-4b2d-8e88-e279c5737095',
                            type: 'qcu-discovery',
                            instruction: "<p>Selon vous, combien y'a t-il de chiens dans la photo ?<br></p>",
                            proposals: [
                              {
                                id: '1',
                                content: '<p>8</p>',
                                feedback: {
                                  diagnosis: '<p>Bien joué !</p>',
                                },
                              },
                              {
                                id: '2',
                                content: '<p>9</p>',
                                feedback: {
                                  diagnosis: "<p>Eh non ! Y'a un bagel dans votre calcul 🥯</p>",
                                },
                              },
                            ],
                            solution: '1',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };
      const moduleDatasourceStub = {
        list: sinon.stub(),
      };
      moduleDatasourceStub.list.resolves([emailModule, bacASableModule]);

      // when
      const modulesMetadata = await moduleMetadataRepository.listPublic({ moduleDatasource: moduleDatasourceStub });

      // then
      const expectedResult = [
        {
          id: emailModule.id,
          shortId: emailModule.shortId,
          slug: emailModule.slug,
          title: emailModule.title,
          isBeta: emailModule.isBeta,
          duration: emailModule.details.duration,
          image: emailModule.details.image,
          link: `/modules/${emailModule.shortId}/${emailModule.slug}`,
          visibility: emailModule.visibility,
        },
        {
          id: bacASableModule.id,
          shortId: bacASableModule.shortId,
          slug: bacASableModule.slug,
          title: bacASableModule.title,
          isBeta: bacASableModule.isBeta,
          duration: bacASableModule.details.duration,
          image: bacASableModule.details.image,
          link: `/modules/${bacASableModule.shortId}/${bacASableModule.slug}`,
          visibility: bacASableModule.visibility,
        },
      ];

      expect(modulesMetadata).to.deep.equal(expectedResult);
    });
    it('should return only modules metadata for public modules', async function () {
      // given
      const publicModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        shortId: 'gbsri73s',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        isBeta: true,
        visibility: Module.VISIBILITY.PUBLIC,
        details: {
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          description:
            'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
          duration: 12,
          level: 'novice',
          tabletSupport: 'comfortable',
          objectives: [
            'Écrire une adresse mail correctement, en évitant les erreurs courantes',
            'Connaître les parties d’une adresse mail et les identifier sur des exemples',
            'Comprendre les fonctions des parties d’une adresse mail',
          ],
        },
        sections: [
          {
            id: '5bf1c672-3746-4480-b9ac-1f0af9c7c509',
            type: 'practise',
            grains: [
              {
                id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
                type: 'lesson',
                title: 'Explications : les parties d’une adresse mail',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: 'd9e8a7b6-5c4d-3e2f-1a0b-9f8e7d6c5b4a',
                      type: 'text',
                      content:
                        "<h4 class='screen-reader-only'>L'arobase</h4><p>L’arobase est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p><span aria-hidden='true'>🇬🇧</span> En anglais, ce symbole se lit <i lang='en'>“at”</i> qui veut dire “chez”.</p><p><span aria-hidden='true'>🤔</span> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>",
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const privateModule = {
        id: 'f730dc0c-9653-492b-a1b6-8978dbac0782',
        shortId: 'absdi73s',
        slug: 'test-module',
        title: 'Des données de test pour le dev',
        isBeta: true,
        visibility: Module.VISIBILITY.PRIVATE,
        details: {
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          description: 'Des données de test pour le dev',
          duration: 12,
          level: 'novice',
          tabletSupport: 'comfortable',
          objectives: ['Du test', 'Du test et encore du test', 'Du test, du test et encore du test'],
        },
        sections: [
          {
            id: '5bf1c672-3746-4480-b9ac-1f0af9c7c509',
            type: 'practise',
            grains: [
              {
                id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
                type: 'lesson',
                title: 'Explications : Comment tester',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: 'd9e8a7b6-5c4d-3e2f-1a0b-9f8e7d6c5b4a',
                      type: 'text',
                      content:
                        "<h4 class='screen-reader-only'>Le test</h4><p>Le test c'est tester encore et toujours</p>",
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
      const moduleDatasourceStub = {
        list: sinon.stub(),
      };
      moduleDatasourceStub.list.resolves([publicModule, privateModule]);

      // when
      const modulesMetadata = await moduleMetadataRepository.listPublic({ moduleDatasource: moduleDatasourceStub });

      // then
      const expectedResult = [
        {
          id: publicModule.id,
          shortId: publicModule.shortId,
          slug: publicModule.slug,
          title: publicModule.title,
          isBeta: publicModule.isBeta,
          duration: publicModule.details.duration,
          image: publicModule.details.image,
          link: `/modules/${publicModule.shortId}/${publicModule.slug}`,
          visibility: publicModule.visibility,
        },
      ];

      expect(modulesMetadata).to.deep.equal(expectedResult);
    });
  });
});
