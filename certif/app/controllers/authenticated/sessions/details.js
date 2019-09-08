import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  session: service(),
  message: null,

  actions: {
    async uploadCertificationCandidates(file) {
      this.set('message', null);
      const { access_token } = this.get('session.data.authenticated');
      try {
        await file.upload(this.model.urlToUpload, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        this.get('model').reload();
        return this.set('message', { type: 'success' });
      }
      catch (error) {
        return this.set('message', { type: 'error', detail: error.detail });
      }
    },
  }
});
