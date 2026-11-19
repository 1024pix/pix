import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';

import ApplicationAdapter from './application';

export default class MissionLearnerAdapter extends ApplicationAdapter {
  query(store: Store, type: ModelSchema, query: { organizationId: string; missionId: string }) {
    const { organizationId, missionId, ...params } = query;
    const url = this.apiUrl(`organizations/${organizationId}/missions/${missionId}/learners`);
    return this.ajax(url, 'GET', { data: this.sortQueryParams(params) });
  }
}
