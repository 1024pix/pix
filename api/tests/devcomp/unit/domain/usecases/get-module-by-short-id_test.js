import { Module } from '../../../../../src/devcomp/domain/models/module/Module.js';
import { getModuleByShortId } from '../../../../../src/devcomp/domain/usecases/get-module-by-short-id.js';
import { config } from '../../../../../src/shared/config.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | UseCases | get-module-by-short-id', function () {
  describe('#getModuleByShortId', function () {
    it('should get and return a Module', async function () {
      // given
      const expectedModule = Symbol('module');
      const shortId = 'l4cr4me7';
      const moduleRepository = {
        getByShortId: sinon.stub(),
      };
      moduleRepository.getByShortId.withArgs({ shortId }).resolves(expectedModule);

      // when
      const module = await getModuleByShortId({ shortId, moduleRepository });

      // then
      expect(module).to.equal(expectedModule);
    });

    it('should highlight glossary words in text elements', async function () {
      // given
      const shortId = 'ab12cd34';
      const textElement = { type: 'text', content: '<p>Le chat ronronne.</p>' };
      const moduleWithGlossary = {
        glossary: [{ word: 'chat', definition: Symbol('definition') }],
        sections: [{ grains: [{ components: [{ type: 'element', element: textElement }] }] }],
      };
      const moduleRepository = { getByShortId: sinon.stub() };
      moduleRepository.getByShortId.withArgs({ shortId }).resolves(moduleWithGlossary);

      // when
      const module = await getModuleByShortId({ shortId, moduleRepository });

      // then
      expect(module.sections[0].grains[0].components[0].element.content).to.equal(
        '<p>Le <button class="module-glossary-word">chat</button> ronronne.</p>',
      );
    });

    it('should get and return a Module with a redirection url', async function () {
      // given
      const id = 1;
      const shortId = 'f9f8bk1d';
      const slug = 'les-adresses-email';
      const title = 'Les adresses email';
      const isBeta = false;
      const sections = [Symbol('text')];
      const details = Symbol('details');
      const version = Symbol('version');
      const visibility = Symbol('visibility');

      const expectedModule = new Module({ id, shortId, slug, title, isBeta, sections, details, version, visibility });
      const moduleRepository = {
        getByShortId: sinon.stub(),
      };
      moduleRepository.getByShortId.withArgs({ shortId }).resolves(expectedModule);
      const expectedUrl = '/parcours/COMBINIX1';
      const encryptedRedirectionUrl = await cryptoService.encrypt(expectedUrl, config.module.secret);

      // when
      const module = await getModuleByShortId({ shortId, encryptedRedirectionUrl, moduleRepository });

      // then
      expect(module.redirectionUrl).to.equal(expectedUrl);
    });
  });
});
