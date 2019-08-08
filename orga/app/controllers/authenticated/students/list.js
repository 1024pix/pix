import Controller from '@ember/controller';
import ENV from 'pix-orga/config/environment';
import { inject as service } from '@ember/service';

export default Controller.extend({

  session: service(),
  currentUser: service(),

  actions: {
    async importStudents(file) {
      const { access_token } = this.get('session.data.authenticated');

      await file.uploadBinary(`${ENV.APP.API_HOST}/api/organizations/${this.get('currentUser.organization.id')}/import-students`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        }
      });
      await this.model.reload();
    }
  },
});
