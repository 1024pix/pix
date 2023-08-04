import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import config from 'pix-admin/config/environment';
import { action } from '@ember/object';

const DEFAULT_PAGE_NUMBER = 1;

export default class AuthenticatedSessionsListAllController extends Controller {
  queryParams = [
    'pageNumber',
    'pageSize',
    'id',
    'certificationCenterName',
    'certificationCenterExternalId',
    'status',
    'version',
  ];
  DEBOUNCE_MS = config.pagination.debounce;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked id = null;
  @tracked certificationCenterName = null;
  @tracked certificationCenterExternalId = null;
  @tracked certificationCenterType = null;
  @tracked status = null;
  @tracked version = null;

  pendingFilters = {};

  @(task(function* (fieldName, param) {
    let value;
    let debounceDuration = this.DEBOUNCE_MS;
    switch (fieldName) {
      case 'id':
      case 'certificationCenterName':
      case 'certificationCenterExternalId':
        value = param.target.value; // param is an InputEvent
        break;
      case 'status':
      case 'version':
      case 'certificationCenterType':
        debounceDuration = 0;
        value = param;
        break;
      default:
        return;
    }
    this.pendingFilters[fieldName] = value;
    yield timeout(debounceDuration);

    // eslint-disable-next-line ember/classic-decorator-no-classic-methods
    this.setProperties(this.pendingFilters);
    this.pendingFilters = {};
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }).restartable())
  triggerFiltering;

  @action
  updateCertificationCenterTypeFilter(newValue) {
    this.certificationCenterType = this._getOrNullForOptionAll(newValue);
    this.triggerFiltering.perform();
  }

  @action
  updateSessionVersionFilter(newValue) {
    this.version = this._getOrNullForOptionAll(newValue);
    this.triggerFiltering.perform();
  }

  @action
  updateSessionStatusFilter(newValue) {
    this.status = this._getOrNullForOptionAll(newValue);
    this.triggerFiltering.perform();
  }

  _getOrNullForOptionAll(value) {
    return value === 'all' ? null : value;
  }
}
