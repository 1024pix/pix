/* eslint-disable ember/classic-decorator-no-classic-methods */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import config from 'pix-admin/config/environment';

const DEFAULT_PAGE_NUMBER = 1;

export default class ListController extends Controller {

  queryParams = ['pageNumber', 'pageSize', 'id', 'name'];
  DEBOUNCE_MS = config.pagination.debounce;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked id = null;
  @tracked name = null;
  pendingFilters = {};

  @(task(function * (fieldName, event) {
    const value = event.target.value;
    this.pendingFilters[fieldName] = value;
    yield timeout(this.DEBOUNCE_MS);
    this.setProperties(this.pendingFilters);
    this.pendingFilters = {};
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }).restartable()) triggerFiltering;

  @action
  goToTargetProfilePage(targetProfileId) {
    this.transitionToRoute('authenticated.target-profiles.target-profile', targetProfileId);
  }
}
