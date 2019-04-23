import { isNone } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  pixScore: null,

  score: computed('pixScore', function() {
    return (isNone(this.pixScore) || this.pixScore === 0) ? '–' : Math.floor(this.pixScore);
  })
});
