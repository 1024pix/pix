import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const DEFAULT_PAGE_NUMBER = 1;

export default class MissionResultsController extends Controller {
  @service router;
  @service intl;
  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 25;
  @tracked divisions = [];
  @tracked results = [];
  @tracked resultOptions = [
    { value: 'no-result', label: this.translateResultOptionKey('no-result') },
    { value: 'not-reached', label: this.translateResultOptionKey('not-reached') },
    { value: 'partially-reached', label: this.translateResultOptionKey('partially-reached') },
    { value: 'reached', label: this.translateResultOptionKey('reached') },
    { value: 'exceeded', label: this.translateResultOptionKey('exceeded') },
  ];
  @tracked name = '';

  translateResultOptionKey(key) {
    return this.intl.t(`pages.missions.mission.table.result.filters.global-result.options.${key}`);
  }

  get learnersCount() {
    return this.model.missionLearners.meta.rowCount;
  }

  @action
  onSelectDivisions(divisions) {
    this.divisions = divisions;
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  onSelectResults(result) {
    this.results = result;
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  onFilter(inputText, value) {
    this[inputText] = value;
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  onResetFilter() {
    this.divisions = [];
    this.results = [];
    this.name = '';
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  refresh() {
    this.send('refreshModel');
  }
}
