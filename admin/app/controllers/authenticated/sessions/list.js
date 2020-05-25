import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import _ from 'lodash';
import config from 'pix-admin/config/environment';
import { statusToDisplayName, FINALIZED } from 'pix-admin/models/session';

const DEFAULT_PAGE_NUMBER = 1;

export default class SessionListController extends Controller {

  queryParams = ['pageNumber', 'pageSize', 'id', 'certificationCenterName', 'status', 'resultsSentToPrescriberAt'];
  DEBOUNCE_MS = config.pagination.debounce;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked id = null;
  @tracked certificationCenterName = null;
  @tracked status = FINALIZED;
  @tracked resultsSentToPrescriberAt = null;
  @tracked assignedToSelfOnly = false;

  pendingFilters = {};

  sessionStatusAndLabels = [
    { status: null, label: 'Tous' },
    ..._.map(statusToDisplayName, (label, status) => ({ status, label })),
  ];

  sessionResultsSentToPrescriberAtAndLabels = [
    { value: null, label: 'Tous' },
    { value: 'true', label: 'Résultats diffusés' },
    { value: 'false', label: 'Résultats non diffusés' },
  ];

  @(task(function* (fieldName, param) {
    let value;
    let debounceDuration = this.DEBOUNCE_MS;
    switch (fieldName) {
      case 'id':
      case 'certificationCenterName':
        value = param.target.value; // param is an InputEvent
        break;
      case 'status':
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
}
