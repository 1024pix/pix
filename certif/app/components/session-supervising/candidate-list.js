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
      if (candidate.authorizedToStart) return authorizedToStartCandidates + 1;
      return authorizedToStartCandidates;
    }, 0);
  }

  get filteredCandidates() {
    const filter = this.filter.toLowerCase();

    return this.args.candidates.filter((candidate) => {
      const startOfFirstName = candidate.firstName.substring(0, filter.length);
      const startOfLastName = candidate.lastName.substring(0, filter.length);
      const fullNameFirstNameFirst = candidate.firstName.concat(' ', candidate.lastName).substring(0, filter.length);
      const fullNameLastNameFirst = candidate.lastName.concat(' ', candidate.firstName).substring(0, filter.length);
      const collator = new Intl.Collator('fr', { sensitivity: 'base' });

      return (
        collator.compare(startOfLastName, filter) === 0 ||
        collator.compare(startOfFirstName, filter) === 0 ||
        collator.compare(fullNameFirstNameFirst, filter) === 0 ||
        collator.compare(fullNameLastNameFirst, filter) === 0
      );
    });
  }
}
