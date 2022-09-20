import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ListController extends Controller {
  @tracked lastName = null;
  @tracked firstName = null;
  @tracked studentNumber = null;
  @tracked groups = [];
  @tracked pageNumber = null;
  @tracked pageSize = null;

  @action
  triggerFiltering(fieldName, value) {
    this[fieldName] = value || undefined;
    this.pageNumber = null;
  }

  @action
  onResetFilter() {
    this.lastName = null;
    this.firstName = null;
    this.studentNumber = null;
    this.groups = [];
  }
}
