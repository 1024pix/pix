import nock from 'nock';

import moduleDatasource from '../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { ElementForVerificationFactory } from '../../../src/devcomp/infrastructure/factories/element-for-verification-factory.js';
import { ModuleFactory } from '../../../src/devcomp/infrastructure/factories/module-factory.js';
import * as elementRepository from '../../../src/devcomp/infrastructure/repositories/element-repository.js';

const modules = await moduleDatasource.list();

describe('Acceptance | Modules', function () {
  beforeEach(function () {
    nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
  });

  describe('Verify modules', function () {
    modules.forEach((moduleData) => {
      it(`module ${moduleData.slug} should respect the domain`, async function () {
        try {
          await ModuleFactory.build(moduleData);

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
