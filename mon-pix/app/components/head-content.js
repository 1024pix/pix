import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import DS from 'ember-data';

const PAGE_TITLE_MAP = {
  'assessments.challenge': 'Évaluation en cours',
  'assessments.checkpoint': 'Avancement de l\'évaluation',
  'assessments.checkpoint.final': 'Fin de votre évaluation',
  'campaigns.campaign-landing-page': 'Présentation | Parcours',
  'campaigns.fill-in-campaign-code': 'Commencer | Parcours',
  'campaigns.skill-review': 'Résultats | Parcours',
  'campaigns.tutorial': 'Didacticiel | Parcours',
  'certifications.start': 'Rejoindre une certification',
  'competence-details': 'Compétence',
  'competences.results': 'Résultat de votre compétence',
  'inscription': 'Inscription',
  'login': 'Connexion',
  'password-reset-demand': 'Oubli de mot de passe',
  'not-connected': 'Déconnecté',
  'profile': 'Votre Profil',
  'reset-password': 'Changer mon mot de passe',
  'user-certifications.index': 'Mes certifications',
};

const CUSTOM_PAGES = [
  'assessments.challenge',
  'assessments.checkpoint',
  'competence-details',
  'competences.results',
];

const PAGE_TITLE_SUFFIX = ' | Pix';
const DEFAULT_PAGE_TITLE = 'Pix – Mesurez, développez et valorisez vos compétences numériques';

export default Component.extend({
  router: service(),
  store: service(),

  pageTitle: computed('router.currentRouteName', function() {
    return DS.PromiseObject.create({
      promise: this._buildPageTitleName()
    });
  }),

  async _buildPageTitleName() {
    const routeName = this.router.currentRouteName;
    if (CUSTOM_PAGES.includes(routeName)
      && this.router.currentRoute.queryParams.finalCheckpoint) {
      return PAGE_TITLE_MAP['assessments.checkpoint.final']
        + await this._computeNameToAppend('assessments.checkpoint.final')
        + PAGE_TITLE_SUFFIX;
    }
    else if (CUSTOM_PAGES.includes(routeName)) {
      return PAGE_TITLE_MAP[routeName]
        + await this._computeNameToAppend(routeName)
        + PAGE_TITLE_SUFFIX;
    }
    else if (PAGE_TITLE_MAP[routeName] != null) {
      return PAGE_TITLE_MAP[routeName]
        + PAGE_TITLE_SUFFIX;
    }
    return DEFAULT_PAGE_TITLE;
  },

  async _computeNameToAppend(page) {
    let nameToAppend = '';
    switch (page) {
      case 'competence-details': {
        const scorecard = await this.store.findRecord('scorecard', this.router.currentRoute.params.scorecard_id);
        if (scorecard) {
          nameToAppend = ' | ' + scorecard.get('name');
        }
        break;
      }
      case 'assessments.challenge':
      case 'assessments.checkpoint.final': {
        const checkpointAssessment = await this.store.findRecord('assessment', this.router.currentRoute.parent.params.assessment_id);
        if (checkpointAssessment) {
          nameToAppend = ' | ' + checkpointAssessment.get('title');
        }
        break;
      }
      case 'competences.results': {
        const resultAssessment = await this.store.findRecord('assessment', this.router.currentRoute.params.assessment_id);
        if (resultAssessment) {
          nameToAppend = ' | ' + resultAssessment.get('title');
        }
        break;
      }
    }
    return nameToAppend;
  }

});
