import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';
import type { SnapshotRecordArray } from '@warp-drive/legacy/compat/-private';

import ApplicationAdapter from './application';

export default class MissionAdapter extends ApplicationAdapter {
  urlForFindAll(
    modelName: string,
    snapshots: SnapshotRecordArray & { adapterOptions: { organizationId: string } },
  ): string {
    const { organizationId } = snapshots.adapterOptions;
    return this.apiUrl(`organizations/${organizationId}/missions`);
  }

  queryRecord(store: Store, type: ModelSchema, query: { organizationId: string; missionId: string }) {
    const { organizationId, missionId, ...params } = query;
    const url = this.apiUrl(`organizations/${organizationId}/missions/${missionId}`);
    return this.ajax(url, 'GET', { data: this.sortQueryParams(params) });
  }
}
