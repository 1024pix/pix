import { FindAllTags } from '../../../../lib/domain/usecases/find-all-tags';
import { tagRepository } from '../../../../lib/infrastructure/repositories/tag-repository';

const { expect, sinon, domainBuilder } = require('../../../test-helper');



describe('Unit | UseCase | find-all-tags', function () {

  it('should return tags', async function () {
    // given
    const tags = [
      domainBuilder.buildTag({ name: 'TAG1' }),
      domainBuilder.buildTag({ name: 'TAG2' }),
      domainBuilder.buildTag({ name: 'TAG3' }),
    ];
    sinon.stub(tagRepository, 'findAll').resolves(tags);

    const findAllTagsUsecase = new FindAllTags(tagRepository)

    // when
    const allTags = await findAllTagsUsecase.execute();

    // then
    expect(allTags).to.deep.equal(tags);
    expect(tagRepository.findAll).to.have.been.calledOnce;
  });

  it('should return an empty array when no tags found', async function () {
    // given
    const findAllTagsUsecase = new FindAllTags(tagRepository)
    sinon.stub(tagRepository, 'findAll').resolves([]);



    // when
    const allTags = await findAllTagsUsecase.execute();

    // then
    expect(allTags).to.be.an('array').that.is.empty;
  });
});
