import { ModuleDoesNotExistError } from '../../../../../../src/devcomp/domain/errors.js';
import moduleDatasource from '../../../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { moduleSchema } from '../../../../../../src/devcomp/infrastructure/datasources/learning-content/validation/module-schema.js';
import { LearningContentResourceNotFound } from '../../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';
import { joiErrorParser } from './validation/joi-error-parser.js';

const modules = await moduleDatasource.list();

describe('Unit | Infrastructure | Datasources | Learning Content | ModuleDatasource', function () {
  describe('#getAllByIds', function () {
    it('should return all modules with ids list in parameters', async function () {
      // Given
      const ids = ['f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d', '6282925d-4775-4bca-b513-4c3009ec5886'];

      // When
      const modules = await moduleDatasource.getAllByIds(ids);

      // Then
      const modulesIds = modules.map((module) => module.id);
      expect(modulesIds).to.have.lengthOf(2);
      expect(modulesIds).to.deep.contains.members(ids);
    });

    context('when modules in the ids list do not exist', function () {
      it('should throw a "ModuleDoesNotExistError" error', async function () {
        // Given
        const notExistingModuleIds = ['not-existing-module-id-1', 'not-existing-module-id-2'];

        const ids = [
          'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
          '6282925d-4775-4bca-b513-4c3009ec5886',
          ...notExistingModuleIds,
        ];

        // When
        const error = await catchErr(moduleDatasource.getAllByIds)(ids);

        // Then
        expect(error).to.be.instanceOf(ModuleDoesNotExistError);
        expect(error.message).to.equal(`Ids with no module: ${notExistingModuleIds}`);
      });
    });
  });

  describe('#getAllByShortIds', function () {
    it('should return all modules with shortIds list in parameters', async function () {
      // Given
      const shortIds = ['6a68bf32', '9d4dcab8'];

      // When
      const modules = await moduleDatasource.getAllByShortIds(shortIds);

      // Then
      const moduleShortIds = modules.map((module) => module.shortId);
      expect(moduleShortIds).to.have.lengthOf(2);
      expect(moduleShortIds).to.deep.contains.members(shortIds);
    });

    context('when modules in the shortIds list do not exist', function () {
      it('should throw a "ModuleDoesNotExistError" error', async function () {
        // Given
        const notExistingModuleShortIds = ['not-existing-module-short-id-1', 'not-existing-module-short-id-2'];

        const shortIds = ['6a68bf32', '9d4dcab8', ...notExistingModuleShortIds];

        // When
        const error = await catchErr(moduleDatasource.getAllByShortIds)(shortIds);

        // Then
        expect(error).to.be.instanceOf(ModuleDoesNotExistError);
        expect(error.message).to.equal(`Short ids with no module: ${notExistingModuleShortIds}`);
      });
    });
  });

  describe('#getByShortId', function () {
    describe('when a module with the given shortId exist', function () {
      it('should return a module', async function () {
        // Given
        const bacASableShortId = '6a68bf32';

        // When
        const module = await moduleDatasource.getByShortId(bacASableShortId);

        // Then
        expect(module).to.exist;
      });
    });

    describe('when a module with the given shortId does not exist', function () {
      it('should throw an ModuleDoesNotExistError', async function () {
        // given
        const id = 'inexistent-shortId';

        // when
        const error = await catchErr(moduleDatasource.getByShortId)(id);

        // then
        expect(error).to.be.instanceOf(ModuleDoesNotExistError);
      });
    });
  });

  describe('#getById', function () {
    describe('when exists', function () {
      it('should return something', async function () {
        // Given
        const id = 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d';
        const module = await moduleDatasource.getById(id);

        // When & then
        expect(module).to.exist;
      });
    });

    describe("when doesn't exist", function () {
      it('should throw an LearningContentResourceNotFound', async function () {
        // given
        const id = 'fake-uuid';

        // when & then
        await expect(moduleDatasource.getById(id)).to.have.been.rejectedWith(LearningContentResourceNotFound);
      });
    });
  });

  describe('#getBySlug', function () {
    describe('when exists', function () {
      it('should return something', async function () {
        // Given
        const slug = 'bien-ecrire-son-adresse-mail';
        const module = await moduleDatasource.getBySlug(slug);

        // When & then
        expect(module).to.exist;
      });
    });

    describe("when doesn't exist", function () {
      it('should throw an LearningContentResourceNotFound', async function () {
        // given
        const slug = 'dresser-un-pokemon';

        // when & then
        await expect(moduleDatasource.getBySlug(slug)).to.have.been.rejectedWith(LearningContentResourceNotFound);
      });
    });
  });

  describe('#list', function () {
    describe('modules content', function () {
      modules.forEach((module) => {
        it(`module "${module.slug}" should contain a valid structure`, async function () {
          try {
            await moduleSchema.validateAsync(module, { abortEarly: false });
          } catch (joiError) {
            const formattedError = joiErrorParser.format(joiError);

            expect(joiError).to.equal(undefined, formattedError);
          }
        });
      });
    });
  });

  describe('#listModulesWithFilename', function () {
    it('should return a list of modules with their filename', async function () {
      // when
      const modules = await moduleDatasource.listModulesWithFilename();

      expect(modules[0].filename).to.exist;
      expect(modules[0].filename).to.be.a('string');
    });
  });
});
