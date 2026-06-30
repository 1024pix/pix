import ApplicationAdapter from './application';

export default class AuthenticationMethodAdapter extends ApplicationAdapter {
  deleteRecord(store, type, snapshot) {
    if (snapshot.adapterOptions?.reassignAuthenticationMethodToAnotherUser) {
      const payload = {
        data: {
          data: {
            attributes: {
              'user-id': snapshot.adapterOptions.targetUserId,
            },
          },
        },
      };

      const url = `${this.host}/${this.namespace}/users/${snapshot.adapterOptions.originUserId}/authentication-methods/${snapshot.id}`;

      return this.ajax(url, 'POST', payload);
    }

    return super.updateRecord(...arguments);
  }
}
