const getRecentlyUsedTags = async function ({ tagId, organizationTagRepository }) {
  return organizationTagRepository.getRecentlyUsedTags({ tagId, numberOfRecentTags: 10 });
};

export { getRecentlyUsedTags };
