import sinon from 'sinon';

import { Module } from '../../../../../src/quest/domain/models/combined-courses/entities/Module.js';
import * as moduleRepository from '../../../../../src/quest/infrastructure/repositories/module-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Repositories | Module Repository', function () {
  describe('#getByIds', function () {
    it('should call getByIds from modulesApi', async function () {
      // given
      const moduleIds = [1, 2];
      const modules = [{ id: 1, title: 'title', slug: 'slug' }];

      const modulesApiStub = {
        getModulesByIds: sinon.stub(),
      };
      modulesApiStub.getModulesByIds.withArgs({ moduleIds }).resolves(modules);

      // when
      const result = await moduleRepository.getByIds({ moduleIds, modulesApi: modulesApiStub });

      // then
      expect(modulesApiStub.getModulesByIds).called;
      expect(result[0]).instanceOf(Module);
    });
  });
});
