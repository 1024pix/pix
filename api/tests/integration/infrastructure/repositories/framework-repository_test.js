import * as frameworkRepository from '../../../../lib/infrastructure/repositories/framework-repository.js';
import { config } from '../../../../src/shared/config.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, knex, mockLearningContent, nock } from '../../../test-helper.js';

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
    await mockLearningContent({
      frameworks: [frameworkData0, frameworkData2, frameworkData1],
    });
  });

  testFrameworkRepository(); // eslint-disable-line mocha/no-setup-in-describe

  describe('when using old learning content', function () {
    beforeEach(function () {
      config.featureToggles.useNewLearningContent = false;
    });

    afterEach(function () {
      config.featureToggles.useNewLearningContent = true;
    });

    testFrameworkRepository(); // eslint-disable-line mocha/no-setup-in-describe
  });

  function testFrameworkRepository() {
    describe('#list', function () {
      it('should return all frameworks when there are some in DB', async function () {
        // when
        const frameworks = await frameworkRepository.list();

        // then
        const expectedFramework0 = domainBuilder.buildFramework({ ...frameworkData0, areas: [] });
        const expectedFramework1 = domainBuilder.buildFramework({ ...frameworkData1, areas: [] });
        const expectedFramework2 = domainBuilder.buildFramework({ ...frameworkData2, areas: [] });
        expect(frameworks).to.deepEqualArray([expectedFramework0, expectedFramework1, expectedFramework2]);
      });

      it('should return an empty array when no frameworks in DB', async function () {
        await knex('learningcontent.frameworks').truncate();
        nock.cleanAll();
        mockLearningContent({ frameworks: [] });

        // when
        const frameworks = await frameworkRepository.list();

        // then
        expect(frameworks).to.deep.equal([]);
      });
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

      it('should return frameworks it managed to find', async function () {
        // when
        const frameworks = await frameworkRepository.findByRecordIds(['recId2', 'recIdCAVA']);

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
  }
});
