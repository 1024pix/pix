import Ember from 'ember';
import _sortBy from 'lodash/sortBy';

export default Ember.Component.extend({

  classNames: ['competence-by-area-item'],
  competenceArea: null,
  _competencesAreaName: Ember.computed('competenceArea.value', function() {
    const competenceAreaName = this.get('competenceArea.value');
    return (competenceAreaName) ? this.get('competenceArea.value').substr(3) : '';
  }),
  _competencesSortedList: Ember.computed('competenceArea.items', function() {
    const competences = this.get('competenceArea.items');
    return _sortBy(competences, (competence) => competence.get('index'));
  })
});
