import Component from '@glimmer/component';

export default class UserCertificationsDetailCompetencesList extends Component {
  get sortedAreas() {
    return this.args.resultCompetenceTree.get('areas').sortBy('code');
  }
}
