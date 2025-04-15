import Component from '@glimmer/component';
import sortBy from 'lodash/sortBy';

export default class UserCertificationsDetailCompetencesList extends Component {
  get sortedAreas() {
    return sortBy(this.args.resultCompetenceTree.get('areas'), 'code');
  }

  get maxReachableLevel() {
    return this.args.maxReachableLevelOnCertificationDate;
  }
}
