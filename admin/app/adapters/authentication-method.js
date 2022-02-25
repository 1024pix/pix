import ApplicationAdapter from './application';

export default class AuthenticationMethodAdapter extends ApplicationAdapter {
  deleteRecord(store, type, snapshot) {
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

      const url = `${this.host}/${this.namespace}/admin/users/${snapshot.adapterOptions.originUserId}/authentication-methods/${snapshot.id}`;

      return this.ajax(url, 'POST', payload);
    }

    return super.updateRecord(...arguments);
  }
}
