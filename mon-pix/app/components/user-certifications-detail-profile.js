import { classNames } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('user-certifications-detail-profile')
export default class UserCertificationsDetailProfile extends Component {
  resultCompetenceTree = null;

  @computed('resultCompetenceTree.areas.[]')
  get sortedAreas() {
    return this.resultCompetenceTree.areas.sortBy('code');
  }
}
