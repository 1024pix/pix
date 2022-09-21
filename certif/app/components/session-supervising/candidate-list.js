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

  @action
  emptySearchInput() {
    this.filter = '';
  }

  get authorizedToStartCandidates() {
    return this.args.candidates.reduce((authorizedToStartCandidates, candidate) => {
      if (candidate.authorizedToStart == true) return authorizedToStartCandidates + 1;
      return authorizedToStartCandidates;
    }, 0);
  }

  get filteredCandidates() {
    const filter = this.filter.toLowerCase();
    return this.args.candidates.filter((candidate) => {
      const firstName = candidate.firstName.toLowerCase();
      const lastName = candidate.lastName.toLowerCase();

      return (
        firstName.startsWith(filter) ||
        lastName.startsWith(filter) ||
        (firstName + ' ' + lastName).startsWith(filter) ||
        (lastName + ' ' + firstName).startsWith(filter)
      );
    });
  }
}
