import Component from '@glimmer/component';
import { action } from '@ember/object';
import noop from 'lodash/noop';

export default class CandidateList extends Component {

  @action
  async toggleCandidate(candidate) {
    await this.args.toggleCandidate(candidate);
  }

  @action
  async authorizeTestResume() {
    noop();
    return Promise.resolve();
  }
}
