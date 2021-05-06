const {
  expect,
  sinon,
  domainBuilder,
} = require('../../../test-helper');

const findAllOrganizationsTags = require('../../../../lib/domain/usecases/find-all-organizations-tags');

describe('Unit | UseCase | find-all-organizations-tags', () => {

  let tagRepository;

  beforeEach(() => {
    tagRepository = {
      findAll: sinon.stub(),
    };
  });

  it('should find all organizations tags', async () => {
    // given
    const tag1 = domainBuilder.buildTag({ name: 'TAG1' });
    const tag2 = domainBuilder.buildTag({ name: 'TAG2' });
    const tag3 = domainBuilder.buildTag({ name: 'TAG3' });
    tagRepository.findAll.returns([tag1, tag2, tag3]);

    // when
    const allTags = await findAllOrganizationsTags({ tagRepository });

    // then
    expect(allTags.length).to.equal(3);
  });

  it('should return an empty array when no organizations tags found', async () => {
    // given
    tagRepository.findAll.returns([]);

    // when
    const allTags = await findAllOrganizationsTags({ tagRepository });

    // then
    expect(allTags).to.be.an('array').that.is.empty;
  });

});
