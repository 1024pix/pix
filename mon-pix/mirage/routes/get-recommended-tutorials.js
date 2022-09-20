import { findPaginatedAndFilteredRecommendedTutorials } from '../handlers/find-paginated-and-filtered-recommended-tutorials';

export default function (config) {
  config.get('/users/tutorials/recommended', findPaginatedAndFilteredRecommendedTutorials);
}
