import { findPaginatedRecommendedTutorials } from '../handlers/find-paginated-recommended-tutorials';

export default function (config) {
  config.get('/users/tutorials/recommended', findPaginatedRecommendedTutorials);
}
