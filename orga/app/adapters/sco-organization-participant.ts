import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';

import type FileSaverService from '../services/file-saver';
import ApplicationAdapter from './application';

export default class ScoOrganizationParticipantAdapter extends ApplicationAdapter {
  query(store: Store, type: ModelSchema, query: { filter: { organizationId: string } }) {
    const {
      filter: { organizationId, ...filter },
      ...params
    } = query;
    const url = this.apiUrl(`organizations/${organizationId}/sco-participants`);
    return this.ajax(url, 'GET', { data: this.sortQueryParams({ ...params, filter }) });
  }

  generateOrganizationLearnersUsernamePassword({
    fileSaver,
    organizationId,
    organizationLearnersIds,
    token,
  }: {
    fileSaver: FileSaverService;
    organizationId: string;
    organizationLearnersIds: string[];
    token: string;
  }) {
    const url = this.apiUrl('sco-organization-learners/batch-username-password-generate');
    const payload = JSON.stringify(
      {
        data: {
          attributes: { 'organization-id': organizationId, 'organization-learners-id': organizationLearnersIds },
        },
      },
      null,
      2,
    );
    const reqHeaders = new Headers();

    reqHeaders.set('Authorization', `Bearer ${token}`);
    reqHeaders.set('Content-Type', 'application/json');

    const request = fetch(url, {
      method: 'POST',
      headers: reqHeaders,
      body: payload,
    });

    return fileSaver.save({ fetcher: () => request });
  }

  unblockOrganizationLearner({
    organizationId,
    organizationLearnerId,
  }: {
    organizationId: string;
    organizationLearnerId: string;
  }) {
    const url = this.apiUrl(
      `organizations/${organizationId}/sco-organization-learners/${organizationLearnerId}/unblock`,
    );
    return this.ajax(url, 'PUT');
  }
}
