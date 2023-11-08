import { catchErr, expect } from '../../../test-helper.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import * as moduleRepository from '../../../../src/devcomp/infrastructure/repositories/module-repository.js';
import { Module } from '../../../../src/devcomp/domain/models/Module.js';
import { Element } from '../../../../src/devcomp/domain/models/element/Element.js';
import moduleDatasource from '../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';

describe('Integration | DevComp | Repositories | ModuleRepository', function () {
  describe('#getBySlug', function () {
    it('should throw an error if the module does not exist', async function () {
      // given
      const nonExistingModuleSlug = 'dresser-des-pokemons';

      // when
      const error = await catchErr(moduleRepository.getBySlug)({ slug: nonExistingModuleSlug, moduleDatasource });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
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
      expect(module.elements.every((element) => element instanceof Element)).to.be.true;
    });
  });
});
