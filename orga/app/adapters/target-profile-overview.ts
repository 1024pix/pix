import type { Snapshot } from '@warp-drive/legacy/compat/-private';

import ApplicationAdapter from './application';

export default class TargetProfileOverviewAdapter extends ApplicationAdapter {
  urlForFindRecord(id: string, modelName: string, snapshot: Snapshot): string {
    const { organizationId } = snapshot.adapterOptions as { organizationId: string };
    return `${this.host}/${this.namespace}/organizations/${organizationId}/target-profiles/${id}`;
  }
}
