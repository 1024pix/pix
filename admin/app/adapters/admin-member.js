import ApplicationAdapter from './application';

export default class AdminMemberAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${this.host}/${this.namespace}/admin-members/me`;
    }

    return super.urlForQueryRecord(...arguments);
  }

  urlForDeactivateMember(adminMemberId) {
    return `${this.host}/${this.namespace}/admin-members/${adminMemberId}/deactivate`;
  }

  urlForUpdateRole(adminMemberId) {
    return `${this.host}/${this.namespace}/admin-members/${adminMemberId}`;
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions.method === 'deactivate') {
      return this.ajax(this.urlForDeactivateMember(snapshot.id), 'PUT');
    } else if (snapshot.adapterOptions.method === 'updateRole') {
      const serializedSnapshot = this.serialize(snapshot);

      const payload = {
        data: {
          attributes: {
            role: serializedSnapshot.data.attributes.role,
          },
        },
      };

      return this.ajax(this.urlForUpdateRole(snapshot.id), 'PATCH', { data: payload });
    }
  }
}
