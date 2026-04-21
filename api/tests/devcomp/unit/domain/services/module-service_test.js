import sinon from 'sinon';

import { ModuleDoesNotExistError } from '../../../../../src/devcomp/domain/errors.js';
import moduleService from '../../../../../src/devcomp/domain/services/module-service.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

const { getModuleByLink } = moduleService;

describe('#getModuleByLink', function () {
  it('should throw an error if link does not match /modules/<slug> pattern', async function () {
    const error = await catchErr(getModuleByLink)({ link: 'bidule' });
    expect(error).to.be.instanceOf(ModuleDoesNotExistError);
    expect(error.message).to.contain('bidule');
  });

  describe('with slug', function () {
    it('should throw an error if link slug does not match any module', async function () {
      const moduleMetadataRepository = { getBySlug: sinon.stub() };
      moduleMetadataRepository.getBySlug.withArgs({ slug: 'wrong-slug' }).rejects(new NotFoundError());
      const error = await catchErr(getModuleByLink)({ link: '/modules/wrong-slug', moduleMetadataRepository });
      expect(error).to.be.instanceOf(ModuleDoesNotExistError);
    });

    it('should return module if link slug matches a module', async function () {
      // given
      const moduleMetadataRepository = { getBySlug: sinon.stub() };
      const expectedModule = Symbol('module');
      moduleMetadataRepository.getBySlug.withArgs({ slug: 'good-slug' }).resolves(expectedModule);

      // when
      const module = await getModuleByLink({ link: '/modules/good-slug', moduleMetadataRepository });

      // then
      expect(module).to.equal(expectedModule);
    });

    it('should return module if absolute link slug matches a module', async function () {
      // given
      const moduleMetadataRepository = { getBySlug: sinon.stub() };
      const expectedModule = Symbol('module');
      moduleMetadataRepository.getBySlug.withArgs({ slug: 'good-slug' }).resolves(expectedModule);

      // when
      const module = await getModuleByLink({ link: 'https://app.pix.fr/modules/good-slug', moduleMetadataRepository });

      // then
      expect(module).to.equal(expectedModule);
    });
  });

  describe('with short id', function () {
    it('should throw an error if link slug does not match any module', async function () {
      const moduleMetadataRepository = { getByShortId: sinon.stub() };
      moduleMetadataRepository.getByShortId.withArgs({ shortId: 'wrong-short-id' }).rejects(new NotFoundError());
      const error = await catchErr(getModuleByLink)({
        link: '/modules/wrong-short-id/wrong-slug',
        moduleMetadataRepository,
      });
      expect(error).to.be.instanceOf(ModuleDoesNotExistError);
    });

    it('should throw an error if short id does not match expected format', async function () {
      const moduleMetadataRepository = { getByShortId: sinon.stub() };
      moduleMetadataRepository.getByShortId.withArgs({ shortId: 'wrong-short-id' }).rejects(new NotFoundError());
      const error = await catchErr(getModuleByLink)({ link: '/modules/bac-a-sable', moduleMetadataRepository });
      expect(error).to.be.instanceOf(ModuleDoesNotExistError);
    });

    it('should return module if link slug matches a module', async function () {
      // given
      const moduleMetadataRepository = { getByShortId: sinon.stub() };
      const expectedModule = Symbol('module');
      moduleMetadataRepository.getByShortId.withArgs({ shortId: 'abcd1234' }).resolves(expectedModule);

      // when
      const module = await getModuleByLink({ link: '/modules/abcd1234/good-slug', moduleMetadataRepository });

      // then
      expect(module).to.equal(expectedModule);
    });

    it('should return module if absolute link slug matches a module', async function () {
      // given
      const moduleMetadataRepository = { getByShortId: sinon.stub() };
      const expectedModule = Symbol('module');
      moduleMetadataRepository.getByShortId.withArgs({ shortId: 'edfg5678' }).resolves(expectedModule);

      // when
      const module = await getModuleByLink({
        link: 'https://app.pix.fr/modules/edfg5678/good-slug',
        moduleMetadataRepository,
      });

      // then
      expect(module).to.equal(expectedModule);
    });
  });
});
