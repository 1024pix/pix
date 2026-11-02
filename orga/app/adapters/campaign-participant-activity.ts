import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';
import type { Snapshot } from '@warp-drive/legacy/compat/-private';

import ApplicationAdapter from './application';

export default class CampaignParticipantActivityAdapter extends ApplicationAdapter {
  query(store: Store, type: ModelSchema, query: { campaignId: string }) {
    const { campaignId, ...params } = query;
    const url = this.apiUrl(`campaigns/${campaignId}/participants-activity`);
    return this.ajax(url, 'GET', { data: this.sortQueryParams(params) });
  }

  urlForDeleteRecord(
    id: string,
    modelName: string,
    snapshot: Snapshot & { adapterOptions: { campaignId: string; campaignParticipationId: string } },
  ): string {
    const { campaignId, campaignParticipationId } = snapshot.adapterOptions;
    return this.apiUrl(`campaigns/${campaignId}/campaign-participations/${campaignParticipationId}`);
  }
}
