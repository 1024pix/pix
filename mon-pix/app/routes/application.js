import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service authentication;
  @service featureToggles;
  @service intl;
  @service oidcIdentityProviders;
  @service session;
  @service splash;
  @service metrics;

  activate() {
    this.splash.hide();
  }

  async beforeModel(transition) {
    this.metrics.initialize();
    await this.session.setup();
    /*
    Ce code permet de définir une locale par défaut différente de celle d'ember-intl.

    Ember-intl utilise "en-us" comme locale par défaut.

    Si aucun fichier de traduction n'existe dans le dossier spécifié dans la configuration d'ember-intl,
    on obtient une URL de ce type : "/?lang=Missing%20translation%20%22current-lang%22%20for%20locale%20%22en-us%22".

    Pour régler ce problème, il faut définir une locale ayant un fichier dans le dossier de traduction.
     */
    this.intl.setLocale('fr');

    await this.featureToggles.load().catch();

    await this.oidcIdentityProviders.load().catch();

    await this.authentication.handleAnonymousAuthentication(transition);

    await this.session.handleUserLanguageAndLocale(transition);
  }

  model() {
    return {
      headElement: document.querySelector('head'),
    };
  }

  @action
  error(error) {
    const isUnauthorizedError = error?.errors?.some((err) => err.status === '401');
    return !isUnauthorizedError;
  }
}
