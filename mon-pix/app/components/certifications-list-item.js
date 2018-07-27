import { computed } from '@ember/object';
import Component from '@ember/component';

const { and, or, not, equal } = computed;

export default Component.extend({
  certification: null,
  classNames: ['certifications-list-item'],
  classNameBindings: [
    'certification.isPublished:certifications-list-item__published-item:certifications-list-item__unpublished-item',
    'isClickable:certifications-list-item__clickable:certifications-list-item__not-clickable',
  ],

  isValidated: equal('certification.status', 'validated'),
  isNotValidated: not('isValidated'),

  isNotPublished: not('certification.isPublished'),
  isPublishedAndRejected: and('isNotValidated', 'certification.isPublished'),
  isPublishedAndValidated: and('isValidated', 'certification.isPublished'),

  shouldDisplayComment: and('isNotValidated', 'certification.{isPublished,commentForCandidate}'),

  isClickable: or('shouldDisplayComment', 'isPublishedAndValidated'),
});
