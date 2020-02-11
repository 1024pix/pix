import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  firstNameValue: computed('firstName', function() {
    return this.get('firstName');
  }),

  lastNameValue: computed('lastName', function() {
    return this.get('lastName');
  }),

  emailValue: computed('email', function() {
    return this.get('email');
  }),
});
