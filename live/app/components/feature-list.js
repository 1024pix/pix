import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['feature-list'],

  init() {
    this._super(...arguments);
    this.features = [{
      icon: 'cafe',
      title: 'Vivez l’expérience PIX',
      description: 'Un parcours d’évaluation convivial, accessible et interactif.'
    }, {
      icon: 'monde',
      title: 'PIX est pour tout le monde',
      description: 'Collégiens, lycéens, étudiants, professionnels, citoyens…'
    }, {
      icon: 'reference',
      title: 'PIX est la référence',
      description: 'La certification nationale de la culture numérique made in France au standard européen.'
    }, {
      icon: 'evolutif',
      title: 'PIX est évolutif',
      description: 'Le référentiel de compétences s’adapte en permanence aux évolutions du monde numérique.'
    }, {
      icon: 'gratuit',
      title: 'PIX est gratuit',
      description: 'Entraînez-vous et progressez gratuitement à votre rythme avant d’être certifié.'
    }];
  }

});
