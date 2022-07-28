import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ListController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'fullName'];

  @tracked pageNumber = 1;
  @tracked pageSize = 25;
  @tracked fullName = null;

  @action
  triggerFiltering(params) {
    this.fullName = params.fullName || undefined;
  }

  @action
  resetFilters() {
    this.pageNumber = undefined;
    this.fullName = undefined;
  }
}
