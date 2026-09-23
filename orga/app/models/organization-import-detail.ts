import type { OrganizationImportStatus } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { DateTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

export interface OrganizationImportError {
  code?: string;
  name?: string;
  meta?: Record<string, unknown>;
  [extra: string]: unknown;
}

export interface OrganizationImportAuthor {
  firstName: string | null;
  lastName: string | null;
}

export default class OrganizationImportDetail extends Model {
  declare [Type]: 'organization-import-detail';

  @attr<StringTransform>('string') declare status: OrganizationImportStatus | null;
  @attr<DateTransform>('date') declare createdAt: Date | null;
  @attr<DateTransform>('date') declare updatedAt: Date | null;
  @attr() declare importErrors: OrganizationImportError[] | null;
  @attr() declare hasFixableErrors: boolean | null;
  @attr() declare createdBy: OrganizationImportAuthor | null;

  get hasError(): boolean {
    return /ERROR/.test(this.status ?? '') && (this.importErrors?.length ?? 0) > 0;
  }

  get hasWarning(): boolean {
    return this.isDone && (this.importErrors?.length ?? 0) > 0;
  }

  get isDone(): boolean {
    return this.status === 'IMPORTED';
  }

  get inProgress(): boolean {
    return this.status !== null && ['UPLOADING', 'UPLOADED', 'VALIDATED'].includes(this.status);
  }
}
