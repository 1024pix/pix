export default async function getRecentlyUsedTags({ tagId, organizationTagRepository }) {
  return organizationTagRepository.getRecentlyUsedTags({ tagId, numberOfRecentTags: 10 });
}
