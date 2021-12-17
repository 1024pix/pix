const { expect, domainBuilder, sinon } = require('../../../test-helper');
const Tag = require('../../../../lib/domain/models/Tag');
const createTag = require('../../../../lib/domain/usecases/create-tag');

describe('Unit | UseCase | create-tag', function () {
  it('should allow to create a tag', async function () {
    // given
    const tagName = 'New name';
    const tag = new Tag({ name: tagName });
    const createdTag = domainBuilder.buildTag({ name: tagName });

    const tagRepository = { create: sinon.stub() };
    tagRepository.create.withArgs(tag).resolves(createdTag);

    // when
    const result = await createTag({ tagName, tagRepository });

    // then
    expect(result).to.be.equal(createdTag);
  });
});
