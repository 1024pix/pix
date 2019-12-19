import Controller from '@ember/controller';
import ENV from 'pix-orga/config/environment';
import { inject as service } from '@ember/service';

export default Controller.extend({

  session: service(),
  currentUser: service(),
  notifications: service('notifications'),

  isLoading: false,

  actions: {
    async importStudents(file) {
      this.set('isLoading', true);
      this.get('notifications').clearAll();
      const { access_token } = this.get('session.data.authenticated');

      try {
        await file.uploadBinary(`${ENV.APP.API_HOST}/api/organizations/${this.get('currentUser.organization.id')}/import-students`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          }
        });
        await this.model.reload();
        this.set('isLoading', false);
        this.get('notifications').sendSuccess('La liste a été importée avec succès.');

      } catch (errorResponse) {
        this.set('isLoading', false);

        if (!errorResponse.body.errors) {
          return this.get('notifications').sendError('Quelque chose s\'est mal passé. Veuillez réessayer.');
        }

        errorResponse.body.errors.forEach((error) => {
          if (error.status === '409') {
            return this.get('notifications').sendWarning(error.detail);
          } else if (error.status === '422') {
            return this.get('notifications').sendError(error.detail);
          }
          return this.get('notifications').sendError('Quelque chose s\'est mal passé. Veuillez réessayer.');
        });
      }
    }
  },
});
