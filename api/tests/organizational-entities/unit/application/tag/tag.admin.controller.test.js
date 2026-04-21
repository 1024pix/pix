import sinon from 'sinon';

import { tagAdminController } from '../../../../../src/organizational-entities/application/tag/tag.admin.controller.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Organizational Entities | Application | Controller | Admin | Tags', function () {
  describe('#findAllTags', function () {
    it('calls findAllTags usecase and tag serializer', async function () {
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
      await tagAdminController.findAllTags({}, hFake, { tagSerializer });

      // then
      expect(usecases.findAllTags).to.have.been.calledOnce;
      expect(tagSerializer.serialize).to.have.been.calledWithExactly(tags);
    });
  });

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
