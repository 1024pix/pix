import Component from '@ember/component';

export default Component.extend({
  classNames: ['partners-enrollment-panel'],
  _enrollment: null,

  init() {
    this._super(...arguments);
    this.set('_enrollment', {
      title: 'Collèges, lycées, établissements d’enseignement supérieur : rejoignez l’aventure Pix dès l’année 2017-2018 !',
      description: 'Je veux que mon établissement propose la certification Pix dès cette année'
    });
  }
});
