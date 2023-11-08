import { catchErr, expect } from '../../../test-helper.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import * as moduleRepository from '../../../../src/devcomp/infrastructure/repositories/module-repository.js';
import { Module } from '../../../../src/devcomp/domain/models/Module.js';
import { Grain } from '../../../../src/devcomp/domain/models/Grain.js';
import moduleDatasource from '../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';

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

    it('should return a module if it exists', async function () {
      // given
      const existingModuleSlug = 'les-adresses-mail';

      // when
      const module = await moduleRepository.getBySlug({
        slug: existingModuleSlug,
        moduleDatasource,
      });

      // then
      expect(module).to.be.instanceOf(Module);
      expect(module.grains.every((grain) => grain instanceof Grain)).to.be.true;
    });
  });
});
