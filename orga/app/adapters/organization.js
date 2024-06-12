import fetch from 'fetch';

import ApplicationAdapter from './application';

export default class OrganizationImportDetailAdapter extends ApplicationAdapter {
  async activateSession({ organizationId, token }) {
    const url = `${this.host}/${this.namespace}/pix1d/schools/${organizationId}/session/activate`;
    return fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
  }
}
