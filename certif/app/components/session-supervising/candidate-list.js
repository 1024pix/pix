import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class CandidateList extends Component {

  @action
  async toggleCandidate(candidate) {
    await this.args.toggleCandidate(candidate);
  }
}
