import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('user-certifications-detail-result')
export default class UserCertificationsDetailResult extends Component {
  certification = null;
}
