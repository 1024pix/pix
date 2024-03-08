import { findAllTags } from '../../../../lib/domain/usecases/find-all-tags.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | find-all-tags', function () {
  let tagRepository;

  beforeEach(function () {
    tagRepository = {
      findAll: sinon.stub(),
    };
  });

  it('should return tags', async function () {
    // given
    const tags = [
      domainBuilder.buildTag({ name: 'TAG1' }),
      domainBuilder.buildTag({ name: 'TAG2' }),
      domainBuilder.buildTag({ name: 'TAG3' }),
    ];
    tagRepository.findAll.returns(tags);

    // when
    const allTags = await findAllTags({ tagRepository });

    // then
    expect(allTags).to.deep.equal(tags);
    expect(tagRepository.findAll).to.have.been.calledOnce;
  });

  it('should return an empty array when no tags found', async function () {
    // given
    tagRepository.findAll.returns([]);

    // when
    const allTags = await findAllTags({ tagRepository });

    // then
    expect(allTags).to.be.an('array').that.is.empty;
  });
});
