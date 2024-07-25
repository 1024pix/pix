import { OrganizationTag } from '../../../../src/shared/domain/models/OrganizationTag.js';
import { OrganizationNotFound, TagNotFoundError } from '../errors.js';

export async function addTagsToOrganizations({
  organizationTags,
  organizationTagRepository,
  tagRepository,
  organizationForAdminRepository,
}) {
  const tagNames = organizationTags.map(({ tagName }) => {
    return tagName;
  });
  const tagMap = await _retrieveTagsByName({ tagNames, tagRepository });

  for (const organizationTag of organizationTags) {
    const { organizationId, tagName } = organizationTag;

    const organization = await organizationForAdminRepository.exist(organizationId);
    if (!organization) {
      throw new OrganizationNotFound({
        meta: {
          organizationId: Number(organizationId),
        },
      });
    }

    const tagId = tagMap.get(tagName).id;

    const isExisting = await organizationTagRepository.isExistingByOrganizationIdAndTagId({
      organizationId,
      tagId,
    });

    if (!isExisting) {
      const organizationTag = new OrganizationTag({ organizationId, tagId });
      await organizationTagRepository.create(organizationTag);
    }
  }
}

async function _retrieveTagsByName({ tagNames, tagRepository }) {
  const uniqTagNames = [...new Set(tagNames)];
  const tagByNames = new Map();
  for (const tagName of uniqTagNames) {
    const tag = await tagRepository.findByName({ name: tagName });

    if (tag === null) {
      throw new TagNotFoundError({ tagName });
    }
    tagByNames.set(tagName, tag);
  }
  return tagByNames;
}
