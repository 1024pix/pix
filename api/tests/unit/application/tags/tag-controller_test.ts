const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const { tagController } = require('../../../../lib/application/tags/tag-controller');
const usecases = require('../../../../lib/domain/usecases');
const { tagSerializer } = require('../../../../lib/infrastructure/serializers/jsonapi/tag-serializer');

describe('Unit | Application | Tags | tag-controller', function () {
  describe('#create', function () {
    it('should return the created tag', async function () {
      // given
      const createdTag = domainBuilder.buildTag({ id: 1, name: 'TAG1' });
      const serializedTag = Symbol('a serialized tag');

      sinon.stub(usecases.createTag, 'execute').resolves(createdTag);

      sinon.stub(tagSerializer, 'serialize').withArgs(createdTag).returns(serializedTag);

      const request = { payload: { data: { attributes: { name: 'tag1' } } } };

      // when
      const result = await tagController.create(request, hFake);

      // then
      expect(usecases.createTag.execute).to.have.been.calledOnce;
      expect(result.source).to.be.equal(serializedTag);
      expect(usecases.createTag.execute).to.have.been.calledOnce;
    });
  });

  describe('#findAllTags', function () {
    it('should call findAllTags usecase and tag serializer', async function () {
      // given
      const tag1 = domainBuilder.buildTag({ id: 1, name: 'TAG1' });
      const tag2 = domainBuilder.buildTag({ id: 2, name: 'TAG2' });
      const tag3 = domainBuilder.buildTag({ id: 3, name: 'TAG3' });

      const tags = [tag1, tag2, tag3];

      sinon.stub(usecases.findAllTags, 'execute').resolves(tags);
      sinon.stub(tagSerializer, 'serialize').resolves();

      // when
      await tagController.findAllTags();

      // then
      expect(usecases.findAllTags.execute).to.have.been.calledOnce;
      expect(tagSerializer.serialize).to.have.been.calledWithExactly(tags);
    });
  });
});
