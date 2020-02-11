import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  nameValue: computed('name', function() {
    return this.get('name');
  }),

  typeValue: computed('type', function() {
    return this.get('type');
  }),

  codeValue: computed('code', function() {
    return this.get('code');
  }),
});
