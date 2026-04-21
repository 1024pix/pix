import crypto from 'node:crypto';

import sinon from 'sinon';

import { ModuleInstantiationError } from '../../../../src/devcomp/domain/errors.js';
import { Module } from '../../../../src/devcomp/domain/models/module/Module.js';
import moduleDatasource from '../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { ModuleFactory } from '../../../../src/devcomp/infrastructure/factories/module-factory.js';
import * as moduleRepository from '../../../../src/devcomp/infrastructure/repositories/module-repository.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';

import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Integration | DevComp | Repositories | ModuleRepository', function () {
  describe('#getById', function () {
    describe('errors', function () {
      it('should throw a NotFoundError if the module does not exist', async function () {
        // given
        const nonExistingModuleSlug = 'uuid-dresser-des-pokemons';

        // when
        const error = await catchErr(moduleRepository.getById)({ slug: nonExistingModuleSlug, moduleDatasource });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });

      it('should throw a NotFoundError if the module instanciation throw an error', async function () {
        // given
        const moduleDatasourceStub = {
          getById: async () => {
            return {
              id: 1,
              slug: 'module-with-error',
            };
          },
        };

        // when
        const error = await catchErr(moduleRepository.getById)({
          id: 1,
          moduleDatasource: moduleDatasourceStub,
        });

        // then
        expect(error).not.to.be.instanceOf(NotFoundError);
      });
    });

    it('should return a Module instance with its version', async function () {
      const existingModuleId = 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d';
      const expectedFoundModule = {
        id: existingModuleId,
        shortId: 'gbsri73s',
        slug: 'existingModuleSlug',
        title: 'Bien écrire son adresse mail',
        isBeta: true,
        visibility: 'public',
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
                      tag: ' ',
                      content:
                        "<h4 class='screen-reader-only'>L'arobase</h4><p>L’arobase est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p><span aria-hidden='true'>🇬🇧</span> En anglais, ce symbole se lit <i lang='en'>“at”</i> qui veut dire “chez”.</p><p><span aria-hidden='true'>🤔</span> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>",
                    },
                  },
                ],
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
      const moduleDatasourceStub = {
        getById: sinon.stub(),
      };
      moduleDatasourceStub.getById.withArgs(existingModuleId).resolves(expectedFoundModule);
      sinon.spy(ModuleFactory, 'build');

      const version = Symbol('version');
      const digestStub = sinon.stub().returns(version);
      const updateStub = sinon.stub();
      const createHashStub = sinon.stub(crypto, 'createHash').returns({
        copy: () => {
          return {
            digest: digestStub,
          };
        },
        update: updateStub,
      });

      // when
      const module = await moduleRepository.getById({
        id: existingModuleId,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(ModuleFactory.build).to.have.been.calledWith({ ...expectedFoundModule, version });
      expect(module).to.be.instanceof(Module);
      expect(createHashStub).to.have.been.calledOnceWith('sha256');
      expect(updateStub).to.have.been.calledOnceWith(JSON.stringify(expectedFoundModule));
      expect(digestStub).to.have.been.calledOnceWith('hex');
    });
  });

  describe('getByShortId', function () {
    describe('errors', function () {
      it('should throw a NotFoundError if the module does not exist', async function () {
        // given
        const nonExistingModuleShortId = 'm4tthia5';

        // when
        const error = await catchErr(moduleRepository.getByShortId)({
          shortId: nonExistingModuleShortId,
          moduleDatasource,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
      it('should throw an Error if module does not build correctly', async function () {
        // given
        const moduleDatasourceStub = {
          getByShortId: async () => {
            return {
              id: 1,
              shortId: 'm4tthia5',
              slug: 'incomplete module',
            };
          },
        };

        sinon.stub(ModuleFactory, 'build').throws(new ModuleInstantiationError());

        // when
        const error = await catchErr(moduleRepository.getByShortId)({
          shortId: 'm4tthia5',
          moduleDatasource: moduleDatasourceStub,
        });

        // then
        expect(error).not.to.be.instanceOf(NotFoundError);
        expect(error).to.be.instanceOf(ModuleInstantiationError);
      });
    });
  });

  describe('#getBySlug', function () {
    describe('errors', function () {
      it('should throw a NotFoundError if the module does not exist', async function () {
        // given
        const nonExistingModuleSlug = 'dresser-des-pokemons';

        // when
        const error = await catchErr(moduleRepository.getBySlug)({ slug: nonExistingModuleSlug, moduleDatasource });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });

      it('should throw a NotFoundError if the module instanciation throw an error', async function () {
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
    });

    it('should return a Module instance with its version', async function () {
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        shortId: 'gbsri73s',
        slug: existingModuleSlug,
        title: 'Bien écrire son adresse mail',
        isBeta: true,
        visibility: 'public',
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
                      tag: ' ',
                      content:
                        "<h4 class='screen-reader-only'>L'arobase</h4><p>L’arobase est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p><span aria-hidden='true'>🇬🇧</span> En anglais, ce symbole se lit <i lang='en'>“at”</i> qui veut dire “chez”.</p><p><span aria-hidden='true'>🤔</span> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>",
                    },
                  },
                ],
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
      const moduleDatasourceStub = {
        getBySlug: sinon.stub(),
      };
      moduleDatasourceStub.getBySlug.withArgs(existingModuleSlug).resolves(expectedFoundModule);
      sinon.spy(ModuleFactory, 'build');

      const version = Symbol('version');
      const digestStub = sinon.stub().returns(version);
      const updateStub = sinon.stub();
      const createHashStub = sinon.stub(crypto, 'createHash').returns({
        copy: () => {
          return {
            digest: digestStub,
          };
        },
        update: updateStub,
      });

      // when
      const module = await moduleRepository.getBySlug({
        slug: existingModuleSlug,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(ModuleFactory.build).to.have.been.calledWith({ ...expectedFoundModule, version });
      expect(module).to.be.instanceof(Module);
      expect(createHashStub).to.have.been.calledOnceWith('sha256');
      expect(updateStub).to.have.been.calledOnceWith(JSON.stringify(expectedFoundModule));
      expect(digestStub).to.have.been.calledOnceWith('hex');
    });
  });

  describe('#list', function () {
    describe('errors', function () {
      describe('if there are no duplicated IDs in modules content', function () {
        it('should result an empty array of duplicated IDs ', async function () {
          const modules = await moduleDatasource.list();
          const ids = [];
          const shortIds = [];

          const duplicateIds = new Set();
          const duplicateShortIds = new Set();

          for (const module of modules) {
            if (ids.includes(module.id)) {
              duplicateIds.add(module.id);
            }
            ids.push(module.id);

            if (shortIds.includes(module.shortId)) {
              duplicateShortIds.add(module.shortId);
            }
            shortIds.push(module.shortId);

            for (const section of module.sections) {
              if (ids.includes(section.id)) {
                duplicateIds.add(section.id);
              }
              ids.push(section.id);

              for (const grain of section.grains) {
                if (ids.includes(grain.id)) {
                  duplicateIds.add(grain.id);
                }
                ids.push(grain.id);

                for (const component of grain.components) {
                  switch (component.type) {
                    case 'element':
                      if (ids.includes(component.element.id)) {
                        duplicateIds.add(component.element.id);
                      }
                      if (component.element.type === 'flashcards') {
                        for (const card of component.element.cards) {
                          if (ids.includes(card.id)) {
                            duplicateIds.add(card.id);
                          }
                          ids.push(card.id);
                        }
                      }
                      ids.push(component.element.id);
                      break;
                    case 'stepper':
                      for (const step of component.steps) {
                        for (const element of step.elements) {
                          if (ids.includes(element.id)) {
                            duplicateIds.add(element.id);
                          }
                          if (element.type === 'flashcards') {
                            for (const card of element.cards) {
                              if (ids.includes(card.id)) {
                                duplicateIds.add(card.id);
                              }
                              ids.push(card.id);
                            }
                          }
                          ids.push(element.id);
                        }
                      }
                      break;
                  }
                }
              }
            }
          }

          expect([...duplicateIds]).to.deep.equal([]);
          expect([...duplicateShortIds]).to.deep.equal([]);
        });
      });
    });

    it('should return a list of Module instances', async function () {
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        shortId: 'gbsri73s',
        slug: existingModuleSlug,
        title: 'Bien écrire son adresse mail',
        isBeta: true,
        visibility: 'public',
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
                      tag: ' ',
                      content:
                        "<h4 class='screen-reader-only'>L'arobase</h4><p>L’arobase est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p><span aria-hidden='true'>🇬🇧</span> En anglais, ce symbole se lit <i lang='en'>“at”</i> qui veut dire “chez”.</p><p><span aria-hidden='true'>🤔</span> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>",
                    },
                  },
                ],
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
      const moduleDatasourceStub = {
        list: sinon.stub(),
      };
      moduleDatasourceStub.list.resolves([expectedFoundModule]);
      sinon.spy(ModuleFactory, 'build');

      // when
      const modules = await moduleRepository.list({ moduleDatasource: moduleDatasourceStub });

      // then
      expect(ModuleFactory.build).to.have.been.calledWith(expectedFoundModule);
      expect(modules).to.be.an('array');
      expect(modules[0]).to.be.instanceof(Module);
    });
  });
});
