import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';

import ApplicationAdapter from './application';

export default class AnalysisByTubeAdapter extends ApplicationAdapter {
  queryRecord(store: Store, type: ModelSchema, query: { organizationId: string }) {
    const { organizationId, ...params } = query;
    const url = this.apiUrl(`organizations/${organizationId}/organization-learners-level-by-tubes`);
    return this.ajax(url, 'GET', { data: this.sortQueryParams(params) });
  }
}
