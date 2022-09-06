import { findPaginatedAndFilteredSavedTutorials } from '../handlers/find-paginated-and-filtered-saved-tutorials';

export default function index(config) {
  config.get('/users/tutorials/saved', findPaginatedAndFilteredSavedTutorials);
}
