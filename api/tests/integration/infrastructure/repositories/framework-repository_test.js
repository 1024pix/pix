const { expect, mockLearningContent, catchErr } = require('../../../test-helper');
const frameworkRepository = require('../../../../lib/infrastructure/repositories/framework-repository');
const Framework = require('../../../../lib/domain/models/Framework');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | framework-repository', function () {
  const framework0 = {
    id: 'recId0',
    name: 'mon framework 0',
  };
  const framework1 = {
    id: 'recId0',
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
      expect(frameworks).to.have.lengthOf(2);
      expect(frameworks[0]).to.be.instanceof(Framework);
    });
  });

  describe('#getByName', function () {
    it('should return a framework', async function () {
      // when
      const framework = await frameworkRepository.getByName('mon framework 1');

      // then
      expect(framework).to.be.instanceof(Framework);
      expect(framework).to.deep.equal(framework1);
    });

    describe('when framework is not found', function () {
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
});
