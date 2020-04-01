import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('user-certifications-detail-competence')
export default class UserCertificationsDetailCompetence extends Component {
  competence = null;
  levels = [1,2,3,4,5,6,7,8];
}
