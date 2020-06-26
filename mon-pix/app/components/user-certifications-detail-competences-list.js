import { classNames } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('user-certifications-detail-competences-list')
export default class UserCertificationsDetailCompetencesList extends Component {
  resultCompetenceTree = null;

  @computed('resultCompetenceTree.areas.[]')
  get sortedAreas() {
    return this.resultCompetenceTree.get('areas').sortBy('code');
  }
}
