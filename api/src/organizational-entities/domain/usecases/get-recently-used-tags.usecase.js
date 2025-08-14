import * as injectedOrganizationTagRepository from '../../infrastructure/repositories/organization-tag.repository.js';
const getRecentlyUsedTags = async function ({
  tagId,
  organizationTagRepository = injectedOrganizationTagRepository,
} = {}) {
  return organizationTagRepository.getRecentlyUsedTags({ tagId, numberOfRecentTags: 10 });
};

export { getRecentlyUsedTags };
