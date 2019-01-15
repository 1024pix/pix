import Controller from '@ember/controller';
/*import { inject as service } from '@ember/service';*/


export default Controller.extend({

  /*store: service(),*/

  actions: {
    updateOrganizationInformation() {
      return this.get('model.organization').save();
    },

    async addMembership() {

      const organization = this.get('model.organization');
      const user = (await this.store.query('user', { email: 'pixmaster@example.net' })).firstObject;
      const membership = this.store.createRecord('membership', { organization, user });
      return membership.save();
    }
  }
});
