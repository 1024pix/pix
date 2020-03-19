import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('user-certifications-detail-header')
export default class UserCertificationsDetailHeader extends Component {
  certification = null;
}
