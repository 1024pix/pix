import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['progress', 'pix-progress-bar'],

  barStyle: computed('progress.stepPercentage', function() {
    return htmlSafe(`width: ${this.get('progress.stepPercentage')}%`);
  })
});
