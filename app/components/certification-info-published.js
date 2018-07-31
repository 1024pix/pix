import Component from '@ember/component';
import {computed} from '@ember/object';

export default Component.extend({
  classNames: ['certification-info-published'],
  classNameBindings: ['float:certification-info-published-float'],

  color:computed('record.isPublished', function() {
    let value = this.get('record.isPublished');
    return value?'#7F7':'#777';
  })
});
