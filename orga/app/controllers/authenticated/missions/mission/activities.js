import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const DEFAULT_PAGE_NUMBER = 1;

export default class MissionActivitiesController extends Controller {
  @service router;
  @service intl;
  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 25;
  @tracked divisions = [];
  @tracked statuses = [];
  @tracked statusOptions = [
    { value: 'not-started', label: this.translateStatusOptionKey('not-started') },
    { value: 'started', label: this.translateStatusOptionKey('started') },
    { value: 'completed', label: this.translateStatusOptionKey('completed') },
  ];
  @tracked name = '';

  translateStatusOptionKey(key) {
    return this.intl.t(`pages.missions.mission.table.activities.mission-status.${key}`);
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
  onSelectStatuses(status) {
    this.statuses = status;
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
    this.statuses = [];
    this.name = '';
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  refresh() {
    this.send('refreshModel');
  }
}
