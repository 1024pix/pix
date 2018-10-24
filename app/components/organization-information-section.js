import Component from '@ember/component';

export default Component.extend({

  // Public props
  organization: null,

  actions: {
    updateLogo(file) {
      return file.readAsDataURL().then((b64) => {
        this.get('organization').set('logoUrl', b64);
        return this.get('onLogoUpdated')();
      });
    }
  }
});
