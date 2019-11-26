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
