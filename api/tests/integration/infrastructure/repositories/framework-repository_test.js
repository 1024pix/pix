const { expect, mockLearningContent } = require('../../../test-helper');
const frameworkRepository = require('../../../../lib/infrastructure/repositories/framework-repository');
const Framework = require('../../../../lib/domain/models/Framework');

describe('Integration | Repository | framework-repository', function () {
  describe('#list', function () {
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

    it('should return all frameworks', async function () {
      // when
      const frameworks = await frameworkRepository.list();

      // then
      expect(frameworks).to.have.lengthOf(2);
      expect(frameworks[0]).to.be.instanceof(Framework);
    });
  });
});
