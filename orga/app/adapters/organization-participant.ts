import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';

import ApplicationAdapter from './application';

export default class OrganizationParticipantAdapter extends ApplicationAdapter {
  protected participantsResource = 'participants';

  query(store: Store, type: ModelSchema, query: { filter: { organizationId: string } }) {
    const {
      filter: { organizationId, ...filter },
      ...params
    } = query;
    const url = this.apiUrl(`organizations/${organizationId}/${this.participantsResource}`);
    return this.ajax(url, 'GET', { data: this.sortQueryParams({ ...params, filter }) });
  }

  addOralizationFeatureForParticipant(learnerId: string, organizationId: string) {
    return this.ajax(this.oralizationFeatureUrl(learnerId, organizationId), 'POST');
  }

  removeOralizationFeatureForParticipant(learnerId: string, organizationId: string) {
    return this.ajax(this.oralizationFeatureUrl(learnerId, organizationId), 'DELETE');
  }

  deleteParticipants(organizationId: string, ids: string[]) {
    const url = this.apiUrl(`organizations/${organizationId}/organization-learners`);
    const payload = { listLearners: ids };
    return this.ajax(url, 'DELETE', { data: payload });
  }

  updateParticipantName(organizationId: string, learnerId: string, firstName: string, lastName: string) {
    const url = this.apiUrl(`organizations/${organizationId}/organization-learners/${learnerId}`);
    return this.ajax(url, 'PATCH', { data: { firstName, lastName } });
  }

  private oralizationFeatureUrl(learnerId: string, organizationId: string): string {
    return this.apiUrl(`organizations/${organizationId}/organization-learners/${learnerId}/features/ORALIZATION`);
  }
}
