import moduleDatasource from '../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { ModuleFactory } from '../../../src/devcomp/infrastructure/factories/module-factory.js';
import { expect } from '../../test-helper.js';

const modules = await moduleDatasource.list();

describe('Acceptance | Modules', function () {
  describe('Verify modules', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    modules.forEach((module) => {
      it(`module ${module.slug} should respect the correct structure`, function () {
        try {
          ModuleFactory.build(module, { isForReferentialValidation: true });
        } catch (e) {
          expect.fail(e.message);
        }
      });
    });
  });
});
