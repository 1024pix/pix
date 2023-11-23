import { catchErr, expect, sinon } from '../../../test-helper.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import * as moduleRepository from '../../../../src/devcomp/infrastructure/repositories/module-repository.js';
import { Module } from '../../../../src/devcomp/domain/models/Module.js';
import { Grain } from '../../../../src/devcomp/domain/models/Grain.js';
import { Text } from '../../../../src/devcomp/domain/models/element/Text.js';
import { QCU } from '../../../../src/devcomp/domain/models/element/QCU.js';
import { Image } from '../../../../src/devcomp/domain/models/element/Image.js';
import moduleDatasource from '../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { QCUForAnswerVerification } from '../../../../src/devcomp/domain/models/element/QCU-for-answer-verification.js';

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
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';

      // when
      const module = await moduleRepository.getBySlug({
        slug: existingModuleSlug,
        moduleDatasource,
      });

      // then
      expect(module).to.be.instanceOf(Module);
      expect(module.grains.every((grain) => grain instanceof Grain)).to.be.true;
    });

    it('should return a module which contains elements of type Text if it exists', async function () {
      // given
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        grains: [
          {
            id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
            type: 'lesson',
            title: 'Explications : les parties d’une adresse mail',
            elements: [
              {
                id: 'c1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
                type: 'text',
                content:
                  "<h3 class='screen-reader-only'>L'identifiant</h3><h4><span aria-hidden='true'>1️⃣</span><span class='screen-reader-only'>1</span> L’identifiant est la première partie de l’adresse mail. Il a été choisi par Mickaël.</h4><p>Tous les identifiants sont possibles, ou presque. Même avec des majuscules !</p><p><span aria-hidden='true'>✅</span> Par exemple : mika671 ou G3oDu671</p><p><span aria-hidden='true'>❌</span> Des caractères sont interdits :</p><ul><li>&amp;</li><li>@</li><li>$</li><li>*</li><li>€</li><li>£</li><li>…</li></ul>",
              },
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
      expect(module.grains.every((grain) => grain.elements.every((element) => element instanceof Text))).to.be.true;
    });

    it('should return a module which contains elements of type QCU if it exists', async function () {
      // given
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        grains: [
          {
            id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
            type: 'lesson',
            title: 'Explications : les parties d’une adresse mail',
            elements: [
              {
                id: 'z3b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p7',
                type: 'qcu',
                instruction: '<p>On peut avoir des chiffres dans l’identifiant de son adresse mail</p>',
                proposals: [
                  {
                    id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    content: 'Vrai',
                  },
                  {
                    id: 'b5a4c3d2-e1f6-7g8h-9i0j-k1l2m3n4o5p6',
                    content: 'Faux',
                  },
                ],
                feedbacks: {
                  valid:
                    '<p>Oui, aucun problème ! Seuls certains caractères sont interdits, comme</p><ul><li>é</li><li>â</li><li>&</li><li>@</li><li>$</li><li>*</li><li>€</li><li>£</li><li>etc…</li></ul>',
                  invalid:
                    '<p>Et si ! les chiffres sont autorisés dans l’identifiant d’une adresse mail. Seuls certains caractères sont interdits, comme</p><ul><li>é</li><li>â</li><li>&</li><li>@</li><li>$</li><li>*</li><li>€</li><li>£</li><li>etc…</li></ul>',
                },
                solution: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
              },
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
      expect(module.grains.every((grain) => grain.elements.every((element) => element instanceof QCU))).to.be.true;
    });

    it('should return a module which contains elements of type Image if it exists', async function () {
      // given
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';
      const expectedFoundModule = {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
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
                alternativeInstruction: 'missing alternative instructions',
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
      expect(module.grains.every((grain) => grain.elements.every((element) => element instanceof Image))).to.be.true;
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

    it('should return a module if it exists', async function () {
      // given
      const existingModuleSlug = 'bien-ecrire-son-adresse-mail';

      // when
      const module = await moduleRepository.getBySlugForVerification({
        slug: existingModuleSlug,
        moduleDatasource,
      });

      // then
      expect(module).to.be.instanceOf(Module);
      expect(
        module.grains.every((grain) =>
          grain.elements
            .filter((element) => element.type === 'qcu')
            .every((qcu) => qcu instanceof QCUForAnswerVerification),
        ),
      ).to.be.true;
    });
  });
});
