import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';

import ApplicationAdapter from './application';

export default class AttestationParticipantStatusAdapter extends ApplicationAdapter {
  query(store: Store, type: ModelSchema, query: { organizationId: string; attestationKey: string }) {
    const { organizationId, attestationKey, ...params } = query;
    const url = this.apiUrl(`organizations/${organizationId}/attestations/${attestationKey}/statuses`);
    return this.ajax(url, 'GET', { data: this.sortQueryParams(params) });
  }
}
