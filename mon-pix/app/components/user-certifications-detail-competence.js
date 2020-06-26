import { computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
export default class UserCertificationsDetailCompetence extends Component {
  @computed('area.resultCompetences.[]')
  get sortedCompetences() {
    return this.area.resultCompetences.sortBy('index');
  }
}
