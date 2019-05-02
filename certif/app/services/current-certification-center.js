import Service from '@ember/service';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';
import { resolve } from 'rsvp';

export default Service.extend({

  certificationCenter: computed(function() {
    return this._certificationCenterPromise ;
  }).readOnly(),

  load(user) {
    if (isEmpty(user)) {
      return resolve();
    }

    return (this._certificationCenterPromise = user.get('certificationCenterMemberships')
      .then((certificationCenterMemberships) => {
        return certificationCenterMemberships.get('firstObject.certificationCenter');
      }));
  }

});
