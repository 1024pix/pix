import { isNone } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['score-pastille'],
  pixScore: null,

  score: computed('pixScore', function() {
    const pixScore = this.get('pixScore');
    return isNone(pixScore) ? '--' : pixScore;
  })
});
