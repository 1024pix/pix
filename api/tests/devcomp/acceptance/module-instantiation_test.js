import moduleDatasource from '../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { ElementForVerificationFactory } from '../../../src/devcomp/infrastructure/factories/element-for-verification-factory.js';
import { ModuleFactory } from '../../../src/devcomp/infrastructure/factories/module-factory.js';
import * as elementRepository from '../../../src/devcomp/infrastructure/repositories/element-repository.js';
import { expect } from '../../test-helper.js';

const modules = await moduleDatasource.list();

describe('Acceptance | Modules', function () {
  describe('Verify modules', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    modules.forEach((moduleData) => {
      it(`module ${moduleData.slug} should respect the domain`, function () {
        try {
          ModuleFactory.build(moduleData);

          const elements = elementRepository.flattenModuleElements(moduleData);
          elements.forEach((element) => {
            ElementForVerificationFactory.build(element);
          });
        } catch (e) {
          expect.fail(e.message);
        }
      });
    });
  });
});
