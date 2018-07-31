import Component from '@ember/component';
import {computed} from '@ember/object';

export default Component.extend({
  classNames: ['certification-list-published'],
  color:computed('record.isPublished', function() {
    let value = this.get('record.isPublished');
    return value?'#7F7':'#777';
  })
});
