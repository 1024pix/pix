import Route from '@ember/routing/route';

export default class SharedCertificationRoute extends Route {

  async redirect(model, transition) {
    if (!model.data) {
      if (transition && transition.from) {
        transition.abort();
      } else {
        this.replaceWith('/verification-certificat');
      }
    }
  }

}
