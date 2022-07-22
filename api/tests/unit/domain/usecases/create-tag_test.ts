const { expect, domainBuilder, sinon } = require('../../../test-helper');
import { Tag } from '../../../../lib/domain/models/Tag';
import { CreateTag } from '../../../../lib/domain/usecases/create-tag';
import { TagRepository, TagRepositoryInterface } from '../../../../lib/infrastructure/repositories/tag-repository';

describe('Unit | UseCase | create-tag', function () {
  it('should allow to create a tag', async function () {
    // given
    const tagName = 'New name';
    const tag = new Tag({ name: tagName });
    const createdTag = domainBuilder.buildTag({ name: tagName });
    const tagRepository: TagRepositoryInterface = new TagRepository();
    sinon.stub(tagRepository, 'create').withArgs(tag).resolves(createdTag);
    const createTagUseCase = new CreateTag(tagRepository);

    // when
    const result = await createTagUseCase.execute(tagName);

    // then
    expect(result).to.be.equal(createdTag);
  });
});
