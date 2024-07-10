import { Module } from '../../../../src/devcomp/domain/models/module/Module.js';
import moduleDatasource from '../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { ModuleFactory } from '../../../../src/devcomp/infrastructure/factories/module-factory.js';
import * as moduleRepository from '../../../../src/devcomp/infrastructure/repositories/module-repository.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';

describe('Integration | DevComp | Repositories | ModuleRepository', function () {
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

      it('should throw an Error if the module instanciation throw an error', async function () {
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

    it('should return a Module instance', async function () {
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        slug: existingModuleSlug,
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
            components: [
              {
                type: 'element',
                element: {
                  id: 'd9e8a7b6-5c4d-3e2f-1a0b-9f8e7d6c5b4a',
                  type: 'text',
                  content:
                    "<h3 class='screen-reader-only'>L'arobase</h3><p>L’arobase est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p><span aria-hidden='true'>🇬🇧</span> En anglais, ce symbole se lit <i lang='en'>“at”</i> qui veut dire “chez”.</p><p><span aria-hidden='true'>🤔</span> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>",
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
      sinon.spy(ModuleFactory, 'build');

      // when
      const module = await moduleRepository.getBySlug({
        slug: existingModuleSlug,
        moduleDatasource: moduleDatasourceStub,
      });

      // then
      expect(ModuleFactory.build).to.have.been.calledWith(expectedFoundModule);
      expect(module).to.be.instanceof(Module);
    });
  });
});
