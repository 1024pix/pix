import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  store: service(),
  router: service(),

  isLoading: false,
  accessCode: null,
  errorMessage: null,
  classNames: ['certification-starter'],

  actions: {
    async submit() {
      this.set('errorMessage', null);
      const { accessCode } = this;
      if (!accessCode) {
        return this.set('errorMessage', 'Merci de saisir un code d’accès valide.');
      }
      this.set('isLoading', true);
      try {
        const certificationCourse = await this.store.createRecord('course', { accessCode }).save();
        await certificationCourse.reload();
        return this.router.replaceWith('certifications.resume', certificationCourse.id);
      } catch ({ errors }) {ppeekerjs
        const { status } = errors[0];
        this.handleErrorStatus(status);
      }
    }
  },
  handleErrorStatus(status) {
    if (status === '404') {
      this.set('errorMessage', 'Ce code n’existe pas ou n’est plus valide.');
    } else {
      this.set('errorMessage', 'Une erreur serveur inattendue vient de se produire');
    }
    return this.set('isLoading', false);
  }
});
