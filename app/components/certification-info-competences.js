import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  init() {
    this._super();
    this.set('competenceList', ['1.1','1.2','1.3','2.1','2.2','2.3','2.4','3.1','3.2','3.3','3.4','4.1','4.2','4.3','5.1','5.2']);
  },
  indexedCompetences:computed('rawCompetences', function() {
    let rawCompetences = this.get('rawCompetences');
    return rawCompetences.reduce((result, value) => {
      value.index = value['competence-code'];
      result[value.index] = value;
      return result;
    }, {});
  })
});
