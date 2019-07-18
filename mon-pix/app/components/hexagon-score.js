import { isNone } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';
import constants from 'mon-pix/static-data/constants-pix-and-level';

export default Component.extend({
  pixScore: null,

  score: computed('pixScore', function() {
    return (isNone(this.pixScore) || this.pixScore === 0) ? '–' : Math.min(Math.floor(this.pixScore), constants.MAX_REACHABLE_TOTAL_PIX);
  })
});
