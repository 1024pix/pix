import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';
import type { Snapshot } from '@warp-drive/legacy/compat/-private';

import type Campaign from '../models/campaign';
import ApplicationAdapter from './application';

interface CampaignPayload {
  data: {
    attributes: Record<string, unknown>;
    relationships: Record<string, unknown>;
  };
}

export default class CampaignAdapter extends ApplicationAdapter {
  query(store: Store, type: ModelSchema, query: { filter: { organizationId: string } }) {
    const {
      filter: { organizationId, ...filter },
      ...params
    } = query;
    const url = this.apiUrl(`organizations/${organizationId}/campaigns`);
    return this.ajax(url, 'GET', { data: this.sortQueryParams({ ...params, filter }) });
  }

  delete(organizationId: string, ids: string[]) {
    const url = this.apiUrl(`organizations/${organizationId}/campaigns`);
    const payload = { data: ids.map((id) => ({ type: 'campaign', id })) };
    return this.ajax(url, 'DELETE', { data: payload });
  }

  archive(campaign: Campaign) {
    return this.ajax(this.archiveUrl(campaign), 'PUT');
  }

  unarchive(campaign: Campaign) {
    return this.ajax(this.archiveUrl(campaign), 'DELETE');
  }

  createRecord(store: Store, type: ModelSchema, snapshot: Snapshot) {
    const payload = this.serialize(snapshot, {}) as unknown as CampaignPayload;
    const campaign = snapshot.record as Campaign;
    const source = campaign.isTypeCombinedCourse ? campaign.combinedCourseBlueprint : campaign.targetProfile;
    const relationship = campaign.isTypeCombinedCourse ? 'combined-course-blueprint' : 'target-profile';
    const resource = campaign.isTypeCombinedCourse ? 'combined-courses' : 'campaigns';

    payload.data.relationships[relationship] = { data: { id: source?.id || campaign.course?.sourceId } };
    return this.ajax(this.apiUrl(resource), 'POST', { data: payload });
  }

  private archiveUrl(campaign: Campaign): string {
    return this.apiUrl(`campaigns/${campaign.id}/archive`);
  }
}
