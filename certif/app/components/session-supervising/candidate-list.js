import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class CandidateList extends Component {

  @action
  async checkCandidate(candidate) {
    await this.args.checkCandidate(candidate, !candidate.authorizedToStart);
  }
}
