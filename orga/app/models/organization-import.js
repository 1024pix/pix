import Model, { attr } from '@ember-data/model';

export default class OrganizationImport extends Model {
  @attr('string') status;
  @attr('date') createdAt;
  @attr('date') updatedAt;
  @attr() errors;

  get hasError() {
    return /ERROR/.test(this.status) && this.errors?.length > 0;
  }

  get hasWarning() {
    return this.isDone && this.errors?.length > 0;
  }

  get isDone() {
    return this.status === 'IMPORTED';
  }
}
