import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ListController extends Controller {
  queryParams = ['lastName', 'fistName', 'studentNumber', 'groups', 'pageNumber', 'pageSize'];

  @tracked lastName = null;
  @tracked firstName = null;
  @tracked studentNumber = null;
  @tracked groups = [];
  @tracked pageNumber = null;
  @tracked pageSize = null;

  @action
  triggerFiltering(fieldName, value) {
    this[fieldName] = value;
    this.pageNumber = null;
  }
}
