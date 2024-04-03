import Model, { attr } from '@ember-data/model';

export default class OrganizationImportDetail extends Model {
  @attr('string') status;
  @attr('date') createdAt;
  @attr('date') updatedAt;
  @attr() errors;
  @attr() createdBy;

  get hasError() {
    return /ERROR/.test(this.status) && this.errors?.length > 0;
  }

  get hasWarning() {
    return this.isDone && this.errors?.length > 0;
  }

  get isDone() {
    return this.status === 'IMPORTED';
  }

  get inProgress() {
    return ['UPLOADED', 'VALIDATED'].includes(this.status);
  }
}
