import Component from '@ember/component';
import ProgressionTrackerMixin from 'mon-pix/mixins/progression-tracker';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend(ProgressionTrackerMixin, {
  router: service(),
  activeComponentName: computed('activeStep', function() {
    return this.activeStep;
  }),
  actions: {
    didMove() {
      if (!this.hasNext()) {
        return this.router.transitionTo(this.exitRoute);
      }
      this.next();
    },
  }
});
