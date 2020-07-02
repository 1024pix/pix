/* eslint ember/no-classic-classes: 0 */
/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-computed-property-dependencies: 0 */
/* eslint ember/require-tagless-components: 0 */

import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: '',

  imageForFormat: {
    'vidéo': 'video',
    'son': 'son',
    'page': 'page'
  },
  tutorial: null,

  formatImageName: computed('tutorial', function() {
    const format = this.tutorial.format;
    if (this.imageForFormat[format]) {
      return this.imageForFormat[format];
    }
    return 'page';
  })

});
