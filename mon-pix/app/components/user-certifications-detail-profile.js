import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['user-certifications-detail-profile'],
  resultCompetenceTree: null,

  sortedAreas: computed('resultCompetenceTree.areas.[]', function() {
    return this.get('resultCompetenceTree.areas').sortBy('code');
  })
});
