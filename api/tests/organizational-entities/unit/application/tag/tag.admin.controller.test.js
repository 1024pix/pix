import { tagAdminController } from '../../../../../src/organizational-entities/application/tag/tag.admin.controller.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Application | Controller | Admin | Tags', function () {
  describe('#create', function () {
    it('returns the created tag', async function () {
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
      const result = await tagAdminController.create(request, hFake, { tagSerializer });

      // then
      expect(result.statusCode).to.be.equal(201);
      expect(result.source).to.be.equal(serializedTag);
    });
  });
});
