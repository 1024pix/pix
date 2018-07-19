import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['user-certifications-detail-area'],
  area: null,

  sortedCompetences: computed('area.resultCompetences.[]', function() {
    return this.get('area.resultCompetences').sortBy('index');
  })
});
