import ApplicationAdapter from './application';

export default class UserAdapter extends ApplicationAdapter {
  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${super.urlForQueryRecord(...arguments)}/me`;
    }

    return super.urlForQueryRecord(...arguments);
  }

  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/admin/users/${id}`;
  }

  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/admin/users/${id}`;
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions && snapshot.adapterOptions.anonymizeUser) {
      const url = this.urlForUpdateRecord(snapshot.id) + '/anonymize';
      return this.ajax(url, 'POST');
    }

    if (snapshot.adapterOptions && snapshot.adapterOptions.dissociate) {
      const url = this.urlForUpdateRecord(snapshot.id) + '/dissociate';
      return this.ajax(url, 'PATCH');
    }

    if (snapshot.adapterOptions && snapshot.adapterOptions.addPixAuthenticationMethod) {
      const payload = {
        data: {
          data: {
            attributes: {
              email: snapshot.adapterOptions.newEmail,
            },
          },
        },
      };
      const url = this.urlForUpdateRecord(snapshot.id) + '/add-pix-authentication-method';
      return this.ajax(url, 'POST', payload);
    }

    if (snapshot.adapterOptions && snapshot.adapterOptions.removeAuthenticationMethod) {
      const payload = {
        data: {
          data: {
            attributes: {
              type: snapshot.adapterOptions.type,
            },
          },
        },
      };
      const url = this.urlForUpdateRecord(snapshot.id) + '/remove-authentication';
      return this.ajax(url, 'POST', payload);
    }

    if (snapshot.adapterOptions && snapshot.adapterOptions.reassignAuthenticationMethodToAnotherUser) {
      const payload = {
        data: {
          data: {
            attributes: {
              'user-id': snapshot.adapterOptions.targetUserId,
              'identity-provider': snapshot.adapterOptions.identityProvider,
            },
          },
        },
      };

      const url =
        this.urlForUpdateRecord(snapshot.id) +
        `/authentication-methods/${snapshot.adapterOptions.authenticationMethodId}`;

      return this.ajax(url, 'POST', payload);
    }

    return super.updateRecord(...arguments);
  }
}
