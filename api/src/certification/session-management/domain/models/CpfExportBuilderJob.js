import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

export class CpfExportBuilderJob {
  constructor({ batchId }) {
    assertNotNullOrUndefined(batchId);
    this.batchId = batchId;
  }
}
