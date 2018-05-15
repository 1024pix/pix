import { computed } from '@ember/object';
import Component from '@ember/component';

const { and, not, equal } = computed;

export default Component.extend({
  certification: null,
  classNames: ['certifications-list-item'],
  classNameBindings: [
    'certification.isPublished:certifications-list-item__published-item:certifications-list-item__unpublished-item',
    'hasComment:certifications-list-item__has-comment:certifications-list-item__no-comment'
  ],

  isValidated: equal('certification.status', 'validated'),
  isNotValidated: not('isValidated'),
  hasComment: and('isNotValidated', 'certification.{isPublished,commentForCandidate}'),
});
