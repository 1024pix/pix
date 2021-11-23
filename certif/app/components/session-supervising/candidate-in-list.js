import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class CandidateInList extends Component {

  @action
  async toggleCandidate(candidate) {
    await this.args.toggleCandidate(candidate);
  }
}
