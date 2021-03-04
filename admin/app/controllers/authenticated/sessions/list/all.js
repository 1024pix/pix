/* eslint-disable ember/classic-decorator-no-classic-methods */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import config from 'pix-admin/config/environment';
import { FINALIZED } from 'pix-admin/models/session';
import { action } from '@ember/object';

const DEFAULT_PAGE_NUMBER = 1;

export default class AuthenticatedSessionsListAllController extends Controller {

  queryParams = ['pageNumber', 'pageSize', 'id', 'certificationCenterName', 'status', 'resultsSentToPrescriberAt'];
  DEBOUNCE_MS = config.pagination.debounce;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked id = null;
  @tracked certificationCenterName = null;
  @tracked certificationCenterType = null;
  @tracked status = FINALIZED;
  @tracked resultsSentToPrescriberAt = null;
  @tracked assignedToSelfOnly = false;

  pendingFilters = {};

  @(task(function* (fieldName, param) {
    let value;
    let debounceDuration = this.DEBOUNCE_MS;
    switch (fieldName) {
      case 'id':
      case 'certificationCenterName':
        value = param.target.value; // param is an InputEvent
        break;
      case 'status':
      case 'certificationCenterType':
      case 'resultsSentToPrescriberAt':
      case 'assignedToSelfOnly':
        debounceDuration = 0;
        value = param;
        break;
      default:
        return;
    }
    this.pendingFilters[fieldName] = value;
    yield timeout(debounceDuration);

    this.setProperties(this.pendingFilters);
    this.pendingFilters = {};
    this.pageNumber = DEFAULT_PAGE_NUMBER;

  }).restartable()) triggerFiltering;

  @action
  updateCertificationCenterTypeFilter(newValue) {
    this.certificationCenterType = this._getOrNullForOptionAll(newValue);
    this.triggerFiltering.perform();
  }

  @action
  updateSessionStatusFilter(newValue) {
    this.status = this._getOrNullForOptionAll(newValue);
    this.triggerFiltering.perform();
  }

  @action
  updateSessionResultsSentToPrescriberFilter(newValue) {
    this.resultsSentToPrescriberAt = this._getOrNullForOptionAll(newValue);
    this.triggerFiltering.perform();
  }

  _getOrNullForOptionAll(value) {
    return value === 'all' ? null : value;
  }
}
