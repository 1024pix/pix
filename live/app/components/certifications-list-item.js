import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  tagName: 'tr',
  certification: null,
  classNames: ['certifications-list-item'],
  classNameBindings: ['certification.isPublished:certifications-list-item__published-item:certifications-list-item__unpublished-item'],

  isValidated: computed('certification', function() {
    return this.get('certification.status') === 'validated';
  }),
});
