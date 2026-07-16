import { setImmediate } from 'node:timers/promises';

import { Module } from '../../../../../src/devcomp/domain/models/module/Module.js';
import moduleDatasource from '../../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import * as moduleRepository from '../../../../../src/devcomp/infrastructure/repositories/module-repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | DevComp | Repositories | ModuleRepository', function () {
  beforeEach(async function () {
    await featureToggles.set('isFetchingModulesFromLearningContentEnabled', true);
    await setImmediate();
  });

  describe('#getById', function () {
    it('should throw a NotFoundError if the module does not exist', async function () {
      // given
      const nonExistingModuleId = 'bfbdb571-e2af-48d4-a999-63e934ada2f9';

      // when
      const error = await catchErr(moduleRepository.getById)({ id: nonExistingModuleId });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should return a Module instance with its version', async function () {
      const existingModuleId = 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d';
      const expectedFoundModule = databaseBuilder.factory.learningContent.buildModule({
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
                      isAnswerable: false,
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
      });
      await databaseBuilder.commit();

      // when
      const module = await moduleRepository.getById({
        id: existingModuleId,
      });

      // then
      expect(module).to.be.instanceOf(Module).and.deep.contain(expectedFoundModule);
    });
  });

  describe('getByShortId', function () {
    it('should throw a NotFoundError if the module does not exist', async function () {
      // given
      const nonExistingModuleShortId = 'm4tthia5';

      // when
      const error = await catchErr(moduleRepository.getByShortId)({
        shortId: nonExistingModuleShortId,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('reads the module from DB', async function () {
      // given
      const shortId = 'm4tthia5';
      const expectedModule = databaseBuilder.factory.learningContent.buildModule({ shortId });
      await databaseBuilder.commit();

      // when
      const module = await moduleRepository.getByShortId({ shortId });

      // then
      expect(module).to.be.instanceOf(Module).and.deep.contain(expectedModule);
    });
  });

  describe('#getBySlug', function () {
    it('should throw a NotFoundError if the module does not exist', async function () {
      // given
      const nonExistingModuleSlug = 'dresser-des-pokemons';

      // when
      const error = await catchErr(moduleRepository.getBySlug)({ slug: nonExistingModuleSlug, moduleDatasource });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('reads the module from DB', async function () {
      const slug = 'bien-ecrire-son-adresse-mail';
      const expectedModule = databaseBuilder.factory.learningContent.buildModule({ slug });
      await databaseBuilder.commit();

      // when
      const module = await moduleRepository.getBySlug({
        slug: slug,
      });

      // then
      expect(module).to.be.instanceOf(Module).and.deep.contain(expectedModule);
    });
  });

  describe('#list', function () {
    it('should return a list of Module instances', async function () {
      const expectedModules = [
        databaseBuilder.factory.learningContent.buildModule({ shortId: 'niconico', slug: 'petit-escargot' }),
        databaseBuilder.factory.learningContent.buildModule({ shortId: 'cacacaca', slug: 'porte-sur-son-dos' }),
        databaseBuilder.factory.learningContent.buildModule({
          shortId: 'pipipipi',
          slug: 'saaaaaa-maisoneeeeeetteuuuuuuh',
        }),
      ];
      await databaseBuilder.commit();

      // when
      const modules = await moduleRepository.list();

      // then
      expect(modules).to.have.lengthOf(3);
      expect(modules[0]).to.be.instanceOf(Module).and.deep.contain(expectedModules[0]);
      expect(modules[1]).to.be.instanceOf(Module).and.deep.contain(expectedModules[1]);
      expect(modules[2]).to.be.instanceOf(Module).and.deep.contain(expectedModules[2]);
    });
  });
});
