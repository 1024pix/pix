import type { SnapshotRecordArray } from '@warp-drive/legacy/compat/-private';

import ApplicationAdapter from './application';

export default class CourseAdapter extends ApplicationAdapter {
  urlForFindAll(
    modelName: string,
    snapshots: SnapshotRecordArray & { adapterOptions: { organizationId: string } },
  ): string {
    const { organizationId } = snapshots.adapterOptions;
    return this.apiUrl(`organizations/${organizationId}/courses`);
  }
}
