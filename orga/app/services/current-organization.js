import Service from '@ember/service';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';
import { resolve } from 'rsvp';

export default Service.extend({

  organization: computed(function() {
    return this._organizationPromise ;
  }).readOnly(),

  load(user) {
    if(isEmpty(user)) {
      return resolve();
    }

    return (this._organizationPromise = user.get('organizationAccesses')
      .then((orgaAccesses) => orgaAccesses.get('firstObject.organization')));
  }

});
