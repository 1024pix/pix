import Component from '@ember/component';
import { classNames, classNameBindings } from '@ember-decorators/component';
import { computed } from '@ember/object';
import classic from 'ember-classic-decorator';

const { and, or, not, equal } = computed;

@classic
@classNames('certifications-list-item')
@classNameBindings(
  'certification.isPublished:certifications-list-item__published-item:certifications-list-item__unpublished-item',
  'isClickable:certifications-list-item__clickable:certifications-list-item__not-clickable'
)
export default class CertificationsListItem extends Component {
  certification = null;

  @equal('certification.status', 'validated')
  isValidated;

  @not('isValidated')
  isNotValidated;

  @not('certification.isPublished')
  isNotPublished;

  @and('isNotValidated', 'certification.isPublished')
  isPublishedAndRejected;

  @and('isValidated', 'certification.isPublished')
  isPublishedAndValidated;

  @and('isNotValidated', 'certification.{isPublished,commentForCandidate}')
  shouldDisplayComment;

  @or('shouldDisplayComment', 'isPublishedAndValidated')
  isClickable;
}
