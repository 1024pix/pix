const { expect, sinon, domainBuilder } = require('../../../test-helper');

const tagController = require('../../../../lib/application/tags/tag-controller');

const usecases = require('../../../../lib/domain/usecases');

const tagSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/tag-serializer');

describe('Unit | Application | Tags | tag-controller', () => {

  describe('#findAllOrganizationsTags', () => {

    it('should call findAllOrganizationsTags usecase and tag serializer', async () => {
      // given
      const tag1 = domainBuilder.buildTag({ id: 1, name: 'TAG1' });
      const tag2 = domainBuilder.buildTag({ id: 2, name: 'TAG2' });
      const tag3 = domainBuilder.buildTag({ id: 3, name: 'TAG3' });

      const allOrganizationTags = [ tag1, tag2, tag3 ];

      sinon.stub(usecases, 'findAllOrganizationsTags').resolves(allOrganizationTags);
      sinon.stub(tagSerializer, 'serialize').resolves();

      // when
      await tagController.findAllOrganizationsTags();

      // then
      expect(usecases.findAllOrganizationsTags).to.have.been.called;
      expect(tagSerializer.serialize).to.have.been.calledWithExactly(allOrganizationTags);
    });

  });

});
