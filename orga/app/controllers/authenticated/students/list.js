import Controller from '@ember/controller';
import ENV from 'pix-orga/config/environment';
import { inject as service } from '@ember/service';

export default Controller.extend({

  session: service(),
  message: null,

  actions: {
    async uploadStudents(file) {
      this.set('message', null);
      const { access_token } = this.get('session.data.authenticated');

      try {
        await file.upload(`${ENV.APP.API_HOST}/api/organizations/${this.model.id}/students`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          }
        });
        this.set('message', 'success');
        this.model.hasMany('students').reload();

      } catch (error) {
        this.set('message', 'error');
      }
    }
  },
});
