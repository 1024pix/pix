import { expect } from 'chai';

import { Module } from '../../../../../src/devcomp/domain/models/module/Module.js';
import { ModuleMetadata } from '../../../../../src/devcomp/domain/models/module/ModuleMetadata.js';
import * as moduleMetadataRepository from '../../../../../src/devcomp/infrastructure/repositories/module-metadata-repository.js';
import { clearCache } from '../../../../../src/devcomp/infrastructure/repositories/module-repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | DevComp | Repositories | ModuleMetadataRepository', function () {
  beforeEach(function () {
    clearCache();
  });

  describe('#getAllByIds', function () {
    it('should return all modules with their metadata', async function () {
      // given
      const firstModule = databaseBuilder.factory.learningContent.buildModule({
        shortId: 'gbsri73s',
        slug: 'getAllByIdsModuleSlug1',
        title: 'Bien écrire son adresse mail',
        isBeta: true,
        visibility: Module.VISIBILITY.PUBLIC,
        details: {
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          description: 'Une description',
          duration: 12,
          level: 'novice',
          tabletSupport: 'comfortable',
          objectives: ['Un objectif'],
        },
      });
      const secondModule = databaseBuilder.factory.learningContent.buildModule({
        shortId: '1bdri73s',
        slug: 'getAllByIdsModuleSlug2',
        title: 'Bac à sable',
        isBeta: true,
        visibility: Module.VISIBILITY.PUBLIC,
        details: {
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          description: 'Une autre description',
          duration: 5,
          level: 'novice',
          tabletSupport: 'inconvenient',
          objectives: ['Un autre objectif'],
        },
      });
      await databaseBuilder.commit();

      // when
      const modules = await moduleMetadataRepository.getAllByIds({ ids: [firstModule.id, secondModule.id] });

      // then
      const expectedResult = [
        new ModuleMetadata({
          id: firstModule.id,
          shortId: firstModule.shortId,
          slug: firstModule.slug,
          title: firstModule.title,
          isBeta: firstModule.isBeta,
          duration: firstModule.details.duration,
          image: firstModule.details.image,
          visibility: firstModule.visibility,
        }),
        new ModuleMetadata({
          id: secondModule.id,
          shortId: secondModule.shortId,
          slug: secondModule.slug,
          title: secondModule.title,
          isBeta: secondModule.isBeta,
          duration: secondModule.details.duration,
          image: secondModule.details.image,
          visibility: secondModule.visibility,
        }),
      ];
      expect(modules).to.have.lengthOf(2);
      expect(modules).to.deep.equal(expectedResult);
    });

    it('should throw a "NotFoundError" when a module does not exist', async function () {
      // given
      const existingModule = databaseBuilder.factory.learningContent.buildModule();
      await databaseBuilder.commit();
      const notExistingModuleId = '00000000-0000-0000-0000-000000000000';

      // when
      const error = await catchErr(moduleMetadataRepository.getAllByIds)({
        ids: [existingModule.id, notExistingModuleId],
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      const expectedErrorMessage = `Modules with ids not found : ${notExistingModuleId}`;
      expect(error.message).to.equal(expectedErrorMessage);
    });
  });

  describe('#getAllByShortIds', function () {
    it('should return all modules with their metadata', async function () {
      // given
      const firstModule = databaseBuilder.factory.learningContent.buildModule({
        shortId: 'gbsri73t',
        slug: 'getAllByShortIdsModuleSlug1',
      });
      const secondModule = databaseBuilder.factory.learningContent.buildModule({
        shortId: '1bdri73t',
        slug: 'getAllByShortIdsModuleSlug2',
      });
      await databaseBuilder.commit();

      // when
      const modules = await moduleMetadataRepository.getAllByShortIds({
        shortIds: [firstModule.shortId, secondModule.shortId],
      });

      // then
      const expectedResult = [
        new ModuleMetadata({
          id: firstModule.id,
          shortId: firstModule.shortId,
          slug: firstModule.slug,
          title: firstModule.title,
          isBeta: firstModule.isBeta,
          duration: firstModule.details.duration,
          image: firstModule.details.image,
          visibility: firstModule.visibility,
        }),
        new ModuleMetadata({
          id: secondModule.id,
          shortId: secondModule.shortId,
          slug: secondModule.slug,
          title: secondModule.title,
          isBeta: secondModule.isBeta,
          duration: secondModule.details.duration,
          image: secondModule.details.image,
          visibility: secondModule.visibility,
        }),
      ];
      expect(modules).to.have.lengthOf(2);
      expect(modules).to.deep.equal(expectedResult);
    });

    it('should throw a "NotFoundError" when a module does not exist', async function () {
      // given
      const notExistingModuleShortIds = ['not-existing-1', 'not-existing-2'];

      // when
      const error = await catchErr(moduleMetadataRepository.getAllByShortIds)({
        shortIds: notExistingModuleShortIds,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      const expectedErrorMessage = `Modules with shortIds not found : ${notExistingModuleShortIds}`;
      expect(error.message).to.equal(expectedErrorMessage);
    });
  });

  describe('#getByShortId', function () {
    it('should return a module with its metadata', async function () {
      // given
      const existingModule = databaseBuilder.factory.learningContent.buildModule({ shortId: 'gbsri73u' });
      await databaseBuilder.commit();

      // when
      const moduleMetadata = await moduleMetadataRepository.getByShortId({ shortId: existingModule.shortId });

      // then
      const expectedModuleMetadata = new ModuleMetadata({
        id: existingModule.id,
        shortId: existingModule.shortId,
        slug: existingModule.slug,
        title: existingModule.title,
        isBeta: existingModule.isBeta,
        duration: existingModule.details.duration,
        image: existingModule.details.image,
        visibility: existingModule.visibility,
      });

      expect(moduleMetadata).to.be.instanceOf(ModuleMetadata);
      expect(moduleMetadata).to.deep.equal(expectedModuleMetadata);
    });

    it('should throw a NotFoundError if the module does not exist', async function () {
      // given
      const nonExistingShortId = 'not-existing-module-short-id';

      // when
      const error = await catchErr(moduleMetadataRepository.getByShortId)({ shortId: nonExistingShortId });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      const expectedErrorMessage = `Module with shortId ${nonExistingShortId} not found`;
      expect(error.message).to.equal(expectedErrorMessage);
    });
  });

  describe('#getBySlug', function () {
    it('should return a module with its metadata', async function () {
      // given
      const existingModule = databaseBuilder.factory.learningContent.buildModule({
        slug: 'bien-ecrire-son-adresse-mail',
      });
      await databaseBuilder.commit();

      // when
      const moduleMetadata = await moduleMetadataRepository.getBySlug({ slug: existingModule.slug });

      // then
      const expectedModuleMetadata = new ModuleMetadata({
        id: existingModule.id,
        shortId: existingModule.shortId,
        slug: existingModule.slug,
        title: existingModule.title,
        isBeta: existingModule.isBeta,
        duration: existingModule.details.duration,
        image: existingModule.details.image,
        visibility: existingModule.visibility,
      });

      expect(moduleMetadata).to.be.instanceOf(ModuleMetadata);
      expect(moduleMetadata).to.deep.equal(expectedModuleMetadata);
    });

    it('should throw a NotFoundError if the module does not exist', async function () {
      // given
      const nonExistingModuleSlug = 'not-existing-module-slug';

      // when
      const error = await catchErr(moduleMetadataRepository.getBySlug)({ slug: nonExistingModuleSlug });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      const expectedErrorMessage = `Module with slug ${nonExistingModuleSlug} not found`;
      expect(error.message).to.equal(expectedErrorMessage);
    });
  });

  describe('#listPublic', function () {
    it('should return a list of modules metadata', async function () {
      // given
      const firstModule = databaseBuilder.factory.learningContent.buildModule({
        shortId: 'gbsri73v',
        slug: 'bien-ecrire-son-adresse-mail-2',
        visibility: Module.VISIBILITY.PUBLIC,
      });
      const secondModule = databaseBuilder.factory.learningContent.buildModule({
        shortId: '6a68bf3v',
        slug: 'bac-a-sable-2',
        visibility: Module.VISIBILITY.PUBLIC,
      });
      await databaseBuilder.commit();

      // when
      const modulesMetadata = await moduleMetadataRepository.listPublic();

      // then
      const expectedResult = [
        new ModuleMetadata({
          id: secondModule.id,
          shortId: secondModule.shortId,
          slug: secondModule.slug,
          title: secondModule.title,
          isBeta: secondModule.isBeta,
          duration: secondModule.details.duration,
          image: secondModule.details.image,
          visibility: secondModule.visibility,
        }),
        new ModuleMetadata({
          id: firstModule.id,
          shortId: firstModule.shortId,
          slug: firstModule.slug,
          title: firstModule.title,
          isBeta: firstModule.isBeta,
          duration: firstModule.details.duration,
          image: firstModule.details.image,
          visibility: firstModule.visibility,
        }),
      ];

      expect(modulesMetadata).to.deep.equal(expectedResult);
    });

    it('should return only modules metadata for public modules', async function () {
      // given
      const publicModule = databaseBuilder.factory.learningContent.buildModule({
        shortId: 'gbsri73w',
        slug: 'bien-ecrire-son-adresse-mail-3',
        visibility: Module.VISIBILITY.PUBLIC,
      });
      databaseBuilder.factory.learningContent.buildModule({
        shortId: 'absdi73w',
        slug: 'test-module-3',
        visibility: Module.VISIBILITY.PRIVATE,
      });
      await databaseBuilder.commit();

      // when
      const modulesMetadata = await moduleMetadataRepository.listPublic();

      // then
      const expectedResult = [
        new ModuleMetadata({
          id: publicModule.id,
          shortId: publicModule.shortId,
          slug: publicModule.slug,
          title: publicModule.title,
          isBeta: publicModule.isBeta,
          duration: publicModule.details.duration,
          image: publicModule.details.image,
          visibility: publicModule.visibility,
        }),
      ];

      expect(modulesMetadata).to.deep.equal(expectedResult);
    });
  });
});
