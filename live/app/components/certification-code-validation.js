import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['certification-code-validation'],

  store: service(),

  accessCode: '',
  _loadingCertification: false,

  actions: {
    submit() {
      this.set('displayInvalidAccessCodeError', false);
      this.set('displayMissingAccessCodeError', false);
      const inputCode = this.get('accessCode');

      if (inputCode.length > 0) {
        this.set('_loadingCertification', true);
        return this.get('store').createRecord('course', { accessCode: inputCode }).save()
          .then((certificationCourse) => {
            this.get('onSubmit')(certificationCourse);
          })
          .catch((error) => {
            if (error.errors[0].status === '404') {
              this.set('displayInvalidAccessCodeError', true);
            } else {
              this.get('error')(error);
            }
            this.set('_loadingCertification', false);
          });
      } else {
        this.set('displayMissingAccessCodeError', true);
      }

    }
  }
});
