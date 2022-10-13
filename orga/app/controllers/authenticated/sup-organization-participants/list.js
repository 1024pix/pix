import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ListController extends Controller {
  @tracked search = null;
  @tracked studentNumber = null;
  @tracked groups = [];
  @tracked certificability = [];
  @tracked pageNumber = null;
  @tracked pageSize = null;

  @action
  triggerFiltering(fieldName, value) {
    this[fieldName] = value || undefined;
    this.pageNumber = null;
  }

  @action
  onResetFilter() {
    this.search = null;
    this.studentNumber = null;
    this.groups = [];
    this.certificability = [];
    this.pageNumber = null;
  }
}
