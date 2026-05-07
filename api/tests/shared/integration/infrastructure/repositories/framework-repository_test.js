import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import * as frameworkRepository from '../../../../../src/shared/infrastructure/repositories/framework-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Repository | framework-repository', function () {
  const frameworkData0 = {
    id: 'recId0',
    name: 'mon framework 0',
  };
  const frameworkData1 = {
    id: 'recId1',
    name: 'mon framework 1',
  };
  const frameworkData2 = {
    id: 'recId2',
    name: 'mon framework 2',
  };

  beforeEach(async function () {
    databaseBuilder.factory.learningContent.build({
      frameworks: [frameworkData0, frameworkData2, frameworkData1],
    });
    await databaseBuilder.commit();
  });

  describe('#getByName', function () {
    it('should return a framework', async function () {
      // when
      const framework = await frameworkRepository.getByName('mon framework 1');

      // then
      const expectedFramework = domainBuilder.buildFramework({ ...frameworkData1, areas: [] });
      expect(framework).to.deepEqualInstance(expectedFramework);
    });

    context('when framework is not found', function () {
      it('should return a rejection', async function () {
        //given
        const frameworkName = 'frameworkData123';

        // when
        const error = await catchErr(frameworkRepository.getByName)(frameworkName);

        // then
        expect(error).to.be.an.instanceof(NotFoundError);
        expect(error.message).to.equal('Framework not found for name frameworkData123');
      });
    });
  });

  describe('#findByRecordIds', function () {
    it('should return frameworks for ids ordered by name', async function () {
      // when
      const frameworks = await frameworkRepository.findByRecordIds(['recId2', 'recId0']);

      // then
      const expectedFramework0 = domainBuilder.buildFramework({ ...frameworkData0, areas: [] });
      const expectedFramework2 = domainBuilder.buildFramework({ ...frameworkData2, areas: [] });
      expect(frameworks).to.deepEqualArray([expectedFramework0, expectedFramework2]);
    });

    it('should return frameworks it managed to find once', async function () {
      // when
      const frameworks = await frameworkRepository.findByRecordIds(['recId2', 'recIdCAVA', 'recId2']);

      // then
      const expectedFramework2 = domainBuilder.buildFramework({ ...frameworkData2, areas: [] });
      expect(frameworks).to.deepEqualArray([expectedFramework2]);
    });

    it('should return an empty array when no frameworks found for ids', async function () {
      // when
      const frameworks = await frameworkRepository.findByRecordIds(['recIdCOUCOU', 'recIdCAVA']);

      // then
      expect(frameworks).to.deepEqualArray([]);
    });
  });
});
