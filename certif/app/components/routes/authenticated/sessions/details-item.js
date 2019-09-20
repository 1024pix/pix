import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  certificationCandidatesCount: computed('session.certificationCandidates.length', function() {
    const certificationCandidatesCount = this.get('session.certificationCandidates.length');
    return certificationCandidatesCount > 0 ? `(${certificationCandidatesCount})`  : '';
  }),
});
