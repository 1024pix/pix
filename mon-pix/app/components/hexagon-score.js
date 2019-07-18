import { isNone } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';
const MAX_REACHABLE_TOTAL_PIX = 640;

export default Component.extend({
  pixScore: null,

  score: computed('pixScore', function() {
    return (isNone(this.pixScore) || this.pixScore === 0) ? '–' : Math.min(Math.floor(this.pixScore), MAX_REACHABLE_TOTAL_PIX);
  })
});
