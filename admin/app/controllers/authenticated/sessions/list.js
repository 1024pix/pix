import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import _ from 'lodash';
import { statusToDisplayName, FINALIZED } from 'pix-admin/models/session';

const DEFAULT_PAGE_NUMBER = 1;

export default class SessionListController extends Controller {

  queryParams = ['pageNumber', 'pageSize', 'id'];

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked id = null;
  @tracked status = FINALIZED;
  @tracked resultsSentToPrescriberAt = null;
  searchFilter = null;

  sessionStatusAndLabels = [
    { status: '', label: 'Tous' },
    ..._.map(statusToDisplayName, (label, status) => ({ status, label })),
  ];

  sessionResultsSentToPrescriberAtAndLabels = [
    { value: '', label: 'Tous' },
    { value: 'true', label: 'Résultats diffusés' },
    { value: 'false', label: 'Résultats non diffusés' },
  ];

  setFieldName() {
    this.searchFilter.fieldName = this.searchFilter.value;
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  setStatusFilter(status) {
    this.status = status;
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  setResultsSentToPrescriberAtFilter(value) {
    this.resultsSentToPrescriberAt = value;
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  triggerFiltering(fieldName, value) {
    this.searchFilter = { fieldName, value };
    debounce(this, this.setFieldName, 500);
  }
}
