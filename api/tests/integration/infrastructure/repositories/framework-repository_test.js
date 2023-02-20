import { expect, domainBuilder, mockLearningContent, catchErr } from '../../../test-helper';
import frameworkRepository from '../../../../lib/infrastructure/repositories/framework-repository';
import { NotFoundError } from '../../../../lib/domain/errors';

describe('Integration | Repository | framework-repository', function () {
  const framework0 = {
    id: 'recId0',
    name: 'mon framework 0',
  };
  const framework1 = {
    id: 'recId1',
    name: 'mon framework 1',
  };
  const framework2 = {
    id: 'recId2',
    name: 'mon framework 2',
  };

  const learningContent = { frameworks: [framework0, framework1, framework2] };

  beforeEach(function () {
    mockLearningContent(learningContent);
  });

  describe('#list', function () {
    it('should return all frameworks', async function () {
      // when
      const frameworks = await frameworkRepository.list();

      // then
      const expectedFramework0 = domainBuilder.buildFramework({ ...framework0, areas: [] });
      const expectedFramework1 = domainBuilder.buildFramework({ ...framework1, areas: [] });
      const expectedFramework2 = domainBuilder.buildFramework({ ...framework2, areas: [] });
      expect(frameworks).to.deepEqualArray([expectedFramework0, expectedFramework1, expectedFramework2]);
    });
  });

  describe('#getByName', function () {
    it('should return a framework', async function () {
      // when
      const framework = await frameworkRepository.getByName('mon framework 1');

      // then
      const expectedFramework1 = domainBuilder.buildFramework({ ...framework1, areas: [] });
      expect(framework).to.deepEqualInstance(expectedFramework1);
    });

    context('when framework is not found', function () {
      it('should return a rejection', async function () {
        //given
        const frameworkName = 'framework123';

        // when
        const error = await catchErr(frameworkRepository.getByName)(frameworkName);

        // then
        expect(error).to.be.an.instanceof(NotFoundError);
        expect(error.message).to.equal('Framework not found for name framework123');
      });
    });
  });

  describe('#findByRecordIds', function () {
    it('should return frameworks for ids ordered by name', async function () {
      // when
      const frameworks = await frameworkRepository.findByRecordIds(['recId2', 'recId0']);

      // then
      const expectedFramework0 = domainBuilder.buildFramework({ ...framework0, areas: [] });
      const expectedFramework2 = domainBuilder.buildFramework({ ...framework2, areas: [] });
      expect(frameworks).to.deepEqualArray([expectedFramework0, expectedFramework2]);
    });

    it('should return an empty array when no frameworks found for ids', async function () {
      // when
      const frameworks = await frameworkRepository.findByRecordIds(['recIdCOUCOU', 'recIdCAVA']);

      // then
      expect(frameworks).to.deepEqualArray([]);
    });
  });
});
