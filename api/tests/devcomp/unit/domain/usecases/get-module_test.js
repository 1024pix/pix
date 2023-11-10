import { getModule } from '../../../../../src/devcomp/domain/usecases/get-module.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Usecases | get-module', function () {
  describe('#getModule', function () {
    it('should get and return a Module', async function () {
      // given
      const expectedModule = Symbol('module');
      const slug = 'bien-ecrire-son-adresse-mail';
      const moduleRepository = {
        getBySlug: sinon.stub(),
      };
      moduleRepository.getBySlug.withArgs({ slug }).resolves(expectedModule);

      // when
      const module = await getModule({ slug, moduleRepository });

      // then
      expect(module).to.equal(expectedModule);
    });
  });
});
