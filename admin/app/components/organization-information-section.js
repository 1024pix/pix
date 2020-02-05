import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  organization: null,

  isOrganizationSCO: computed('organization.type', function() {
    return this.organization.type === 'SCO';
  }),

  isManagingStudents: computed('organization.isManagingStudents', function() {
    return this.organization.isManagingStudents ? 'Oui' : 'Non';
  }),

  actions: {
    updateLogo(file) {
      return file.readAsDataURL().then((b64) => {
        this.set('organization.logoUrl', b64);
        return this.onLogoUpdated();
      });
    }
  }
});
