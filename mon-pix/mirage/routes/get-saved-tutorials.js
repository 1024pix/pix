import { findPaginatedSavedTutorials } from '../handlers/find-paginated-saved-tutorials';

export default function index(config) {
  config.get('/users/tutorials/saved', findPaginatedSavedTutorials);
}
