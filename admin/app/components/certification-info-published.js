import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['certification-info-published'],
  classNameBindings: ['float:certification-info-published-float'],

  color: computed('record.isPublished', function() {
    const value = this.get('record.isPublished');
    return value ? '#39B97A' : '#8090A5';
  })
});
