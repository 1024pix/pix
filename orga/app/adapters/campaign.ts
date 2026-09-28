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
  urlForQuery(query: Record<string, unknown>, modelName: string): string {
    const filter = query.filter as { organizationId?: string };
    if (filter.organizationId) {
      const { organizationId } = filter;
      delete filter.organizationId;

      return `${this.host}/${this.namespace}/organizations/${organizationId}/campaigns`;
    }
    return super.urlForQuery(query, modelName);
  }

  delete(organizationId: string, ids: string[]) {
    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/campaigns`;
    const payload = { data: ids.map((id) => ({ type: 'campaign', id })) };
    return this.ajax(url, 'DELETE', { data: payload });
  }

  archive(model: Campaign) {
    const url = this._buildURL('campaign', model.id) + '/archive';
    return this.ajax(url, 'PUT');
  }

  unarchive(model: Campaign) {
    const url = this._buildURL('campaign', model.id) + '/archive';
    return this.ajax(url, 'DELETE');
  }

  createRecord(store: Store, type: ModelSchema, snapshot: Snapshot) {
    const payload = this.serialize(snapshot, {}) as unknown as CampaignPayload;
    const record = snapshot.record as Campaign;

    if (payload.data.attributes.type === 'COMBINED_COURSE') {
      payload.data.relationships['combined-course-blueprint'] = {
        data: { id: record.combinedCourseBlueprint?.id || record.course?.sourceId },
      };
      const url = `${this.host}/${this.namespace}/combined-courses`;

      return this.ajax(url, 'POST', { data: payload });
    } else {
      payload.data.relationships['target-profile'] = {
        data: { id: record.targetProfile?.id || record.course?.sourceId },
      };

      const url = `${this.host}/${this.namespace}/campaigns`;

      return this.ajax(url, 'POST', { data: payload });
    }
  }
}
