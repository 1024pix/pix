const { expect, mockLearningContent, domainBuilder } = require('../../../test-helper');
const thematicRepository = require('../../../../lib/infrastructure/repositories/thematic-repository');

describe('Integration | Repository | thematic-repository', function () {
  describe('#list', function () {
    it('should return the thematics', async function () {
      // given
      const thematic = domainBuilder.buildThematic({ id: 'recThematic1' });

      const learningContent = {
        thematics: [thematic],
      };

      mockLearningContent(learningContent);

      // when
      const actualThematics = await thematicRepository.list();

      // then
      expect(actualThematics).to.deepEqualArray([thematic]);
    });
  });
});
