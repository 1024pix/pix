import Component from '@glimmer/component';
import sortBy from 'lodash/sortBy';

export default class UserCertificationsDetailCompetence extends Component {
  get sortedCompetences() {
    return sortBy(this.args.area?.resultCompetences, 'index');
  }
}
