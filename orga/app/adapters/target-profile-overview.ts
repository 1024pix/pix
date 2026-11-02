import type { Snapshot } from '@warp-drive/legacy/compat/-private';

import ApplicationAdapter from './application';

export default class TargetProfileOverviewAdapter extends ApplicationAdapter {
  urlForFindRecord(
    id: string,
    modelName: string,
    snapshot: Snapshot & { adapterOptions: { organizationId: string } },
  ): string {
    const { organizationId } = snapshot.adapterOptions;
    return this.apiUrl(`organizations/${organizationId}/target-profiles/${id}`);
  }
}
