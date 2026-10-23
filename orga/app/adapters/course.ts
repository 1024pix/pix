import type { SnapshotRecordArray } from '@warp-drive/legacy/compat/-private';

import ApplicationAdapter from './application';

export default class CourseAdapter extends ApplicationAdapter {
  urlForFindAll(modelName: string, snapshots: SnapshotRecordArray): string {
    const { organizationId } = snapshots.adapterOptions as { organizationId: string };
    return `${this.host}/${this.namespace}/organizations/${organizationId}/courses`;
  }
}
