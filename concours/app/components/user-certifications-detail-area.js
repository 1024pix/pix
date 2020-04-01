import { classNames } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('user-certifications-detail-area')
export default class UserCertificationsDetailArea extends Component {
  area = null;

  @computed('area.resultCompetences.[]')
  get sortedCompetences() {
    return this.get('area.resultCompetences').sortBy('index');
  }
}
