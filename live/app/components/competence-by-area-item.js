import { computed } from '@ember/object';
import Component from '@ember/component';
import _sortBy from 'lodash/sortBy';

export default Component.extend({

  classNames: ['competence-by-area-item'],
  competenceArea: null,
  _competencesAreaName: computed('competenceArea.value', function() {
    const competenceAreaName = this.get('competenceArea.value');
    return (competenceAreaName) ? this.get('competenceArea.value').substr(3) : '';
  }),
  _competencesSortedList: computed('competenceArea.items', function() {
    const competences = this.get('competenceArea.items');
    return _sortBy(competences, (competence) => competence.get('index'));
  })
});
