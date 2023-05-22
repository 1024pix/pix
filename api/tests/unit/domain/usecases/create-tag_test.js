import { expect, domainBuilder, sinon } from '../../../test-helper.js';
import { Tag } from '../../../../lib/domain/models/Tag.js';
import { createTag } from '../../../../lib/domain/usecases/create-tag.js';

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
