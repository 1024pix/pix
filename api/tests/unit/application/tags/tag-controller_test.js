const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const tagController = require('../../../../lib/application/tags/tag-controller');
const usecases = require('../../../../lib/domain/usecases/index.js');

describe('Unit | Application | Tags | tag-controller', function () {
  describe('#create', function () {
    it('should return the created tag', async function () {
      // given
      const createdTag = domainBuilder.buildTag({ id: 1, name: 'TAG1' });
      const serializedTag = Symbol('a serialized tag');

      sinon.stub(usecases, 'createTag').resolves(createdTag);
      const tagSerializer = {
        serialize: sinon.stub(),
      };
      tagSerializer.serialize.withArgs(createdTag).returns(serializedTag);

      const request = { payload: { data: { attributes: { name: 'tag1' } } } };

      // when
      const result = await tagController.create(request, hFake, { tagSerializer });

      // then
      expect(result.statusCode).to.be.equal(201);
      expect(result.source).to.be.equal(serializedTag);
    });
  });

  describe('#findAllTags', function () {
    it('should call findAllTags usecase and tag serializer', async function () {
      // given
      const tag1 = domainBuilder.buildTag({ id: 1, name: 'TAG1' });
      const tag2 = domainBuilder.buildTag({ id: 2, name: 'TAG2' });
      const tag3 = domainBuilder.buildTag({ id: 3, name: 'TAG3' });

      const tags = [tag1, tag2, tag3];

      sinon.stub(usecases, 'findAllTags').resolves(tags);
      const tagSerializer = {
        serialize: sinon.stub(),
      };

      // when
      await tagController.findAllTags({}, hFake, { tagSerializer });

      // then
      expect(usecases.findAllTags).to.have.been.calledOnce;
      expect(tagSerializer.serialize).to.have.been.calledWithExactly(tags);
    });
  });
});
