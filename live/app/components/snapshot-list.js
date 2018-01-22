import { isPresent } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({

  organization: null,
  snapshots: null,
  _hasSnapshots: computed('snapshots', function() {
    return isPresent(this.get('snapshots.length')) && this.get('snapshots.length') > 0;
  })

});
