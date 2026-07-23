import Model, { attr } from '@warp-drive/legacy/model';

export default class OrganizationImportDetail extends Model {
  @attr('string') status;
  @attr('date') createdAt;
  @attr('date') updatedAt;
  @attr() errors;
  @attr() hasFixableErrors;
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
    return ['UPLOADING', 'UPLOADED', 'VALIDATED'].includes(this.status);
  }
}
