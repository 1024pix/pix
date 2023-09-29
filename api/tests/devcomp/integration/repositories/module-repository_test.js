import { catchErr, expect } from '../../../test-helper.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import * as moduleRepository from '../../../../src/devcomp/infrastructure/repositories/module-repository.js';
import moduleDatasource from '../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { Module } from '../../../../src/devcomp/domain/models/Module.js';

describe('Integration | DevComp | Repositories | ModuleRepository', function () {
  describe('#getBySlug', function () {
    it('should throw an error if the module does not exist', async function () {
      // when
      const error = await catchErr(moduleRepository.getBySlug)({ slug: 'foo' });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should return a module if it exists', async function () {
      // given
      const existingModule = new Module({ id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d', title: 'Les adresses mail' });

      // when
      const module = await moduleRepository.getBySlug({ slug: 'les-adresses-mail', moduleDatasource });

      //then
      expect(module).to.be.instanceOf(Module);
      expect(module.id).equal(existingModule.id);
      expect(module.title).equal(existingModule.title);
    });
  });
});
