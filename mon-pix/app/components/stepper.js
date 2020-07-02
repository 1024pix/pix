/* eslint ember/no-actions-hash: 0 */
/* eslint ember/no-classic-classes: 0 */
/* eslint ember/no-classic-components: 0 */
/* eslint ember/no-component-lifecycle-hooks: 0 */
/* eslint ember/require-computed-macros: 0 */
/* eslint ember/require-tagless-components: 0 */

import Component from '@ember/component';
import ProgressionTrackerMixin from 'mon-pix/mixins/progression-tracker';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend(ProgressionTrackerMixin, {
  router: service(),
  stepsData: {},

  activeComponentName: computed('activeStep', function() {
    return this.activeStep;
  }),

  actions: {
    didMove() {
      this.next();
    },
  }
});
