import Component from '@glimmer/component';

export default class UserCertificationsDetailCompetence extends Component {
  get sortedCompetences() {
    return this.args.area.resultCompetences.sortBy('index');
  }
}
