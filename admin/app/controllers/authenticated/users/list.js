import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import config from 'pix-admin/config/environment';

const DEFAULT_PAGE_NUMBER = 1;

export default class ListController extends Controller {

  queryParams = ['pageNumber', 'pageSize', 'firstName', 'lastName', 'email'];
  DEBOUNCE_MS = config.pagination.debounce;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked firstName = null;
  @tracked lastName = null;
  @tracked email = null;

  @(task(function * (fieldName, event) {
    const value = event.target.value;
    yield timeout(this.DEBOUNCE_MS);
    this[fieldName] = value;
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }).restartable()) triggerFiltering;

  @action
  goToUserDetailPage(userId) {
    this.transitionToRoute('authenticated.users.get', userId);
  }
}
