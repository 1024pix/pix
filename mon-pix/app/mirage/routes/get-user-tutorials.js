import { findPaginatedAndFilteredTutorials } from '../handlers/find-paginated-and-filtered-tutorials';

export default function index(config) {
  config.get('/users/:id/tutorials', findPaginatedAndFilteredTutorials);
}
