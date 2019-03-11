import Component from '@ember/component';
import { computed } from '@ember/object';
import _capitalize from 'lodash/capitalize';

export default Component.extend({

  idPixLabelDisplay: computed('campaign.idPixLabel', function () {
    const idPixLabel = this.get('campaign.idPixLabel');
    return _capitalize(idPixLabel);
  }),

});
