import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CandidateList extends Component {
  @tracked filter = '';

  @action
  async toggleCandidate(candidate) {
    await this.args.toggleCandidate(candidate);
  }

  @action
  async authorizeTestResume(candidate) {
    await this.args.authorizeTestResume(candidate);
  }

  @action
  async endAssessmentBySupervisor(candidate) {
    await this.args.endAssessmentBySupervisor(candidate);
  }

  @action
  setFilter(event) {
    this.filter = event.target.value;
  }

  get filteredCandidates() {
    return this.args.candidates.filter(
      (candidate) =>
        candidate.firstName.toLowerCase().indexOf(this.filter.toLowerCase()) === 0 ||
        candidate.lastName.toLowerCase().indexOf(this.filter.toLowerCase()) === 0
    );
  }
}
