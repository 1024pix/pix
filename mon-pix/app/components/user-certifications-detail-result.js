/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('user-certifications-detail-result')
export default class UserCertificationsDetailResult extends Component {
  certification = null;
}
