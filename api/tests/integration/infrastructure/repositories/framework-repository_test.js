const { expect, domainBuilder, mockLearningContent, catchErr } = require('../../../test-helper');
const frameworkRepository = require('../../../../lib/infrastructure/repositories/framework-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | framework-repository', function () {
  const framework0 = {
    id: 'recId0',
    name: 'mon framework 0',
  };
  const framework1 = {
    id: 'recId1',
    name: 'mon framework 1',
  };

  const learningContent = { frameworks: [framework0, framework1] };

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
      expect(frameworks).to.deepEqualArray([expectedFramework0, expectedFramework1]);
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

  describe('#getById', function () {
    it('should return a framework', async function () {
      // when
      const framework = await frameworkRepository.getById('recId1');

      // then
      const expectedFramework1 = domainBuilder.buildFramework({ ...framework1, areas: [] });
      expect(framework).to.deepEqualInstance(expectedFramework1);
    });

    context('when framework is not found', function () {
      it('should return a rejection', async function () {
        //given
        const unknownFrameworkId = 'recUnknownFmk';

        // when
        const error = await catchErr(frameworkRepository.getById)(unknownFrameworkId);

        // then
        expect(error).to.be.an.instanceof(NotFoundError);
        expect(error.message).to.equal('Framework not found for id recUnknownFmk');
      });
    });
  });
});
