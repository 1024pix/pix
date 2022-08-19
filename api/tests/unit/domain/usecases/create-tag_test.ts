const { expect, domainBuilder, sinon } = require('../../../test-helper');
const { Tag } = require('../../../../lib/domain/models/Tag');
const {CreateTag} = require('../../../../lib/domain/usecases/create-tag');

describe('Unit | UseCase | create-tag', function () {
  it('should allow to create a tag', async function () {
    // given
    const tagName = 'New name';
    const tag = new Tag({ name: tagName });
    const createdTag = domainBuilder.buildTag({ name: tagName });

    const tagRepository = { create: sinon.stub() };
    tagRepository.create.withArgs(tag).resolves(createdTag);
    const createTag = new CreateTag(tagRepository);

    // when
    const result = await createTag.execute(tagName);

    // then
    expect(result).to.be.equal(createdTag);
  });
});
