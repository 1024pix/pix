const {
  expect,
  sinon,
  domainBuilder,
} = require('../../../test-helper');

const tagController = require('../../../../lib/application/tags/tag-controller');
const usecases = require('../../../../lib/domain/usecases');
const tagSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/tag-serializer');

describe('Unit | Application | Tags | tag-controller', () => {

  describe('#findAllTags', () => {

    it('should call findAllTags usecase and tag serializer', async () => {
      // given
      const tag1 = domainBuilder.buildTag({ id: 1, name: 'TAG1' });
      const tag2 = domainBuilder.buildTag({ id: 2, name: 'TAG2' });
      const tag3 = domainBuilder.buildTag({ id: 3, name: 'TAG3' });

      const tags = [ tag1, tag2, tag3 ];

      sinon.stub(usecases, 'findAllTags').resolves(tags);
      sinon.stub(tagSerializer, 'serialize').resolves();

      // when
      await tagController.findAllTags();

      // then
      expect(usecases.findAllTags).to.have.been.calledOnce;
      expect(tagSerializer.serialize).to.have.been.calledWithExactly(tags);
    });

  });

});
