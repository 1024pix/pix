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
    'ids',
    'certificationCenterName',
    'certificationCenterExternalId',
    'status',
    'version',
  ];
  DEBOUNCE_MS = config.pagination.debounce;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 100;
  @tracked ids = null;
  @tracked certificationCenterName = null;
  @tracked certificationCenterExternalId = null;
  @tracked certificationCenterType = null;
  @tracked status = null;
  @tracked version = null;

  get filters() {
    return {
      ids: this.ids,
      certificationCenterName: this.certificationCenterName,
      certificationCenterExternalId: this.certificationCenterExternalId,
      certificationCenterType: this.certificationCenterType,
      status: this.status,
      version: this.version,
    };
  }

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
  updateSelectFilter(fieldName, newValue) {
    this[fieldName] = this._getOrNullForOptionAll(newValue);
    this.updateFilters({ [fieldName]: this[fieldName] });
  }

  _getOrNullForOptionAll(value) {
    return value === 'all' ? null : value;
  }
}
