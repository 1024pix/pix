import type { Snapshot } from '@warp-drive/legacy/compat/-private';

import ApplicationAdapter from './application';

export default class CampaignParticipantActivity extends ApplicationAdapter {
  urlForQuery(query: Record<string, unknown>, modelName: string): string {
    if (query.campaignId) {
      const { campaignId } = query as { campaignId: string };
      delete query.campaignId;
      return `${this.host}/${this.namespace}/campaigns/${campaignId}/participants-activity`;
    }
    return super.urlForQuery(query, modelName);
  }

  urlForDeleteRecord(id: string, modelName: string, snapshot: Snapshot): string {
    const { campaignId, campaignParticipationId } = snapshot.adapterOptions as {
      campaignId: string;
      campaignParticipationId: string;
    };
    return `${this.host}/${this.namespace}/campaigns/${campaignId}/campaign-participations/${campaignParticipationId}`;
  }
}
