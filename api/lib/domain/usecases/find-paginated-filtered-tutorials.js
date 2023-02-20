import Tutorial from '../models/Tutorial';

export default async function findPaginatedFilteredTutorials({ userId, filters, page, locale, tutorialRepository }) {
  if (filters?.type === Tutorial.TYPES.RECOMMENDED) {
    const { results: tutorials, pagination } = await tutorialRepository.findPaginatedFilteredRecommendedByUserId({
      userId,
      filters,
      locale,
      page,
    });
    return { tutorials, meta: { pagination } };
  }

  const { models: tutorials, meta: pagination } = await tutorialRepository.findPaginatedFilteredForCurrentUser({
    userId,
    filters,
    page,
  });
  return { tutorials, meta: { pagination } };
}
