import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['certification-banner'],
  user: null,

  fullname: computed('user', function() {
    return `${this.get('user.firstName')} ${ this.get('user.lastName')}`;
  })

});
