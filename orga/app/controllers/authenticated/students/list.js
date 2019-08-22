import Controller from '@ember/controller';
import ENV from 'pix-orga/config/environment';
import { inject as service } from '@ember/service';

export default Controller.extend({

  session: service(),
  currentUser: service(),
  message: null,

  actions: {
    async importStudents(file) {
      this.set('message', null);
      const { access_token } = this.get('session.data.authenticated');

      try {
        await file.uploadBinary(`${ENV.APP.API_HOST}/api/organizations/${this.get('currentUser.organization.id')}/import-students`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          }
        });
        await this.model.reload();
        this.set('message', { type: 'success' });

      } catch (errorResponse) {

        if (!errorResponse.body.errors) {
          return this.set('message', { type: 'error' });
        }

        errorResponse.body.errors.forEach((error) => {
          if (error.status === '409') {
            return this.set('message', { type: 'warning', detail: error.detail });
          } else if (error.status === '422') {
            return this.set('message', { type: 'error', detail: error.detail });
          }
          return this.set('message', { type: 'error' });
        });
      }
    }
  },
});
