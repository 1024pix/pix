import { Module } from '../../../src/devcomp/domain/models/module/Module.js';
import moduleDatasource from '../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { expect } from '../../test-helper.js';

const modules = await moduleDatasource.list();

describe('Acceptance | Modules', function () {
  describe('Verify modules', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    modules.forEach((module) => {
      it(`module ${module.slug} should respect the correct structure`, function () {
        try {
          Module.toDomainForVerification(module);
        } catch (e) {
          expect.fail(e.message);
        }
      });
    });
  });
});
