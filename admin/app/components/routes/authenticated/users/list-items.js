import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  firstNameValue: computed('firstName', function() {
    return this.firstName;
  }),

  lastNameValue: computed('lastName', function() {
    return this.lastName;
  }),

  emailValue: computed('email', function() {
    return this.email;
  }),
});
