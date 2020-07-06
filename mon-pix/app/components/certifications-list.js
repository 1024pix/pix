/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import Component from '@ember/component';
import { classNames } from '@ember-decorators/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('certifications-list')
export default class CertificationsList extends Component {
  certifications = null;
}
