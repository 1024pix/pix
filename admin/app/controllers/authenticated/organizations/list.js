import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import config from 'pix-admin/config/environment';

const DEFAULT_PAGE_NUMBER = 1;

export default class ListController extends Controller {

  queryParams = ['pageNumber', 'pageSize', 'name', 'type', 'externalId'];
  DEBOUNCE_MS = config.pagination.debounce;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked name = null;
  @tracked type = null;
  @tracked externalId = null;

  @(task(function * (fieldName, event) {
    const value = event.target.value;
    yield timeout(this.DEBOUNCE_MS);
    this[fieldName] = value;
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }).restartable()) triggerFiltering;

  @action
  goToOrganizationPage(organizationId) {
    this.transitionToRoute('authenticated.organizations.get', organizationId);
  }
}
