import Model, { attr } from '@ember-data/model';

export default class FrameworkHistory extends Model {
  @attr() history;

  get hasDraft() {
    return this.history?.some((version) => version.status === 'DRAFT');
  }

  get activeHistory() {
    return this.history?.find((version) => version.status === 'ACTIVE') ?? null;
  }
}
