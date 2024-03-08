import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { debounceTask } from 'ember-lifeline';
import config from 'pix-admin/config/environment';

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

  updateFilters(filters) {
    for (const filterKey of Object.keys(filters)) {
      this[filterKey] = filters[filterKey];
    }
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  triggerFiltering(fieldName, event) {
    debounceTask(this, 'updateFilters', { [fieldName]: event.target.value }, this.DEBOUNCE_MS);
  }

  @action
  updateCertificationCenterTypeFilter(newValue) {
    this.certificationCenterType = this._getOrNullForOptionAll(newValue);
    this.updateFilters({ certificationCenterType: this.certificationCenterType });
  }

  @action
  updateSessionVersionFilter(newValue) {
    this.version = this._getOrNullForOptionAll(newValue);
    this.updateFilters({ version: this.version });
  }

  @action
  updateSessionStatusFilter(newValue) {
    this.status = this._getOrNullForOptionAll(newValue);
    this.updateFilters({ status: this.status });
  }

  _getOrNullForOptionAll(value) {
    return value === 'all' ? null : value;
  }
}
