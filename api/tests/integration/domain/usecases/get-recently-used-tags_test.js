import _ from 'lodash';
import { expect, databaseBuilder } from '../../../test-helper';
import getRecentlyUsedTags from '../../../../lib/domain/usecases/get-recently-used-tags';
import Tag from '../../../../lib/domain/models/Tag';
import organizationTagRepository from '../../../../lib/infrastructure/repositories/organization-tag-repository';

describe('Integration | UseCase | get-recently-used-tags', function () {
  it('returns 10 recently used tags based on a tag id and ordered by the most used first', async function () {
    // given
    const basedTag = databaseBuilder.factory.buildTag({ name: 'konoha' });
    const mostUsedTag = databaseBuilder.factory.buildTag({ name: 'kumo' });
    const leastUsedTag = databaseBuilder.factory.buildTag({ name: 'hueco mundo' });
    const tags = [
      mostUsedTag,
      databaseBuilder.factory.buildTag({ name: 'kiri' }),
      databaseBuilder.factory.buildTag({ name: 'suna' }),
      databaseBuilder.factory.buildTag({ name: 'oto' }),
      databaseBuilder.factory.buildTag({ name: 'ame' }),
      databaseBuilder.factory.buildTag({ name: 'iwa' }),
      databaseBuilder.factory.buildTag({ name: 'uzushio' }),
      databaseBuilder.factory.buildTag({ name: 'seireitei' }),
      databaseBuilder.factory.buildTag({ name: 'karakura' }),
      leastUsedTag,
      databaseBuilder.factory.buildTag({ name: 'yuei' }),
    ];
    const organizations = [];

    _.times(11, () => organizations.push(databaseBuilder.factory.buildOrganization()));

    for (const [index, organization] of organizations.entries()) {
      const tagIds = tags.slice(0, index + 1).map(({ id }) => id);
      tagIds.push(basedTag.id);
      _buildOrganizationTags(organization.id, tagIds);
    }

    await databaseBuilder.commit();

    // when
    const recentlyUsedTags = await getRecentlyUsedTags({ tagId: basedTag.id, organizationTagRepository });

    // then
    expect(recentlyUsedTags.length).to.equal(10);
    expect(recentlyUsedTags[0]).to.deepEqualInstance(new Tag(mostUsedTag));
    expect(recentlyUsedTags[recentlyUsedTags.length - 1]).to.deepEqualInstance(new Tag(leastUsedTag));
  });
});

function _buildOrganizationTags(organizationId, tagIds) {
  tagIds.forEach((tagId) => {
    databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });
  });
}
