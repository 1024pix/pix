import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';

import ApplicationAdapter from './application';

export default class OrganizationLearnerActivityAdapter extends ApplicationAdapter {
  queryRecord(store: Store, type: ModelSchema, query: { organizationLearnerId: string }) {
    const { organizationLearnerId, ...params } = query;
    const url = this.apiUrl(`organization-learners/${organizationLearnerId}/activity`);
    return this.ajax(url, 'GET', { data: this.sortQueryParams(params) });
  }
}
