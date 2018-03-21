import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['certification-code-validation'],

  store: service(),

  accessCode: '',
  _loadingCertification: false,

  actions: {
    submit() {
      this.set('_loadingCertification', true);
      return this.get('store').createRecord('course', { accessCode: this.get('accessCode') }).save()
        .then((certificationCourse) => {
          this.get('onSubmit')(certificationCourse);
        })
        .catch((error) => {
          if (error.errors[0].status === '404') {
            this.set('displayErrorMessage', true);
            this.set('_loadingCertification', false);
          } else {
            this.set('_loadingCertification', false);
            this.get('error')(error);
          }
        });
    }
  }
});
