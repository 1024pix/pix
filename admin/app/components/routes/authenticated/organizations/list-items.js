import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  nameValue: computed('name', function() {
    return this.name;
  }),

  typeValue: computed('type', function() {
    return this.type;
  }),

  codeValue: computed('code', function() {
    return this.code;
  }),

  externalIdValue: computed('externalId', function() {
    return this.get('externalId');
  }),
});
