import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('user-certifications-panel')
export default class UserCertificationsPanel extends Component {
  certifications = null;
}
