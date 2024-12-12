import nock from 'nock';

import { learningContentCache } from '../../../../../src/shared/infrastructure/caches/learning-content-cache.js';
import { expect, mockLearningContent, sinon } from '../../../../test-helper.js';

describe('Integration | Infrastructure | Caches | LearningContentCache', function () {
  describe('#get', function () {
    it('should get learning content from underlying cache (redis not used in test)', async function () {
      // given
      const learningContent = { models: [{ id: 'recId' }] };
      const lcmsApiCall = await mockLearningContent(learningContent);

      // when
      const result = await learningContentCache.get();

      // then
      expect(result).to.deep.equal(learningContent);
      expect(lcmsApiCall.isDone()).to.be.true;
    });
  });

  describe('#reset', function () {
    it('should set learning content in underlying cache', async function () {
      // given
      const learningContent = { models: [{ id: 'recId' }] };
      const lcmsApiCall = await mockLearningContent(learningContent);
      const underlyingCacheSpy = sinon.spy(learningContentCache._underlyingCache, 'set');

      // when
      await learningContentCache.reset();

      // then
      expect(underlyingCacheSpy).to.have.been.calledWith('LearningContent', learningContent);
      expect(lcmsApiCall.isDone()).to.be.true;
    });
  });

  describe('#update', function () {
    it('should update cache with new learning content retrieved from lcms client', async function () {
      // given
      const learningContent = { models: [{ id: 'recId' }] };
      const lcmsApiCall = nock('https://lcms-test.pix.fr/api')
        .post('/releases')
        .matchHeader('Authorization', 'Bearer test-api-key')
        .reply(200, { content: learningContent });
      const underlyingCacheSpy = sinon.spy(learningContentCache._underlyingCache, 'set');

      // when
      await learningContentCache.update();

      // then
      expect(underlyingCacheSpy).to.have.been.calledWith('LearningContent', learningContent);
      expect(lcmsApiCall.isDone()).to.be.true;
    });
  });
});
