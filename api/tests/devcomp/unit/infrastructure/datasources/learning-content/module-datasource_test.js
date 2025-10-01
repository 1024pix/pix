import { ModuleDoesNotExistError } from '../../../../../../src/devcomp/domain/errors.js';
import moduleDatasource from '../../../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { LearningContentResourceNotFound } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, expect } from '../../../../../test-helper.js';
import { joiErrorParser } from './validation/joi-error-parser.js';
import { moduleSchema } from './validation/module-schema.js';

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
          // We need to increase the timeout because the validation can be slow for large modules
          this.timeout(30000);
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
});
