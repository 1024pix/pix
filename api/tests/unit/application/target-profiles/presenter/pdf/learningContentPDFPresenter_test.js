const learningContentPDFPresenter = require('../../../../../../lib/application/target-profiles/presenter/pdf/learningContentPDFPresenter');
const { domainBuilder, expect } = require('../../../../../test-helper');

describe('Unit | Presenter | target-profile-pdf-presenter', function () {
  describe('#present', function () {
    it('should succeed fr', async function () {
      const learningContent = domainBuilder.buildLearningContent();
      const result = await learningContentPDFPresenter.present(learningContent, 'title', 'fr');

      expect(result).not.null;
      expect(result.length).equal(2597052);
    });
    it('should succeed en', async function () {
      const learningContent = domainBuilder.buildLearningContent();
      const result = await learningContentPDFPresenter.present(learningContent, 'title', 'en');

      expect(result).not.null;
      expect(result.length).equal(2597084);
    });
  });
});
