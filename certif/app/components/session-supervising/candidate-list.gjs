import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import CandidateInList from 'pix-certif/components/session-supervising/candidate-in-list';

export default class CandidateList extends Component {
  @tracked filter = '';

  get startedCandidatesCount() {
    return this.args.candidates.filter((c) => c.hasStarted).length;
  }

  get activeCandidatesCount() {
    return this.args.candidates.filter((c) => (c.authorizedToStart && !c.assessmentStatus) || c.hasStarted).length;
  }

  get filteredCandidates() {
    const filter = this.filter;

    return this.args.candidates.filter((candidate) => {
      const startOfFirstName = candidate.firstName.substring(0, filter.length);
      const startOfLastName = candidate.lastName.substring(0, filter.length);
      const fullNameFirstNameFirst = candidate.firstName.concat(' ', candidate.lastName).substring(0, filter.length);
      const fullNameLastNameFirst = candidate.lastName.concat(' ', candidate.firstName).substring(0, filter.length);
      const collator = new Intl.Collator('fr', { sensitivity: 'base', ignorePunctuation: true });

      return (
        collator.compare(startOfLastName, filter) === 0 ||
        collator.compare(startOfFirstName, filter) === 0 ||
        collator.compare(fullNameFirstNameFirst, filter) === 0 ||
        collator.compare(fullNameLastNameFirst, filter) === 0
      );
    });
  }

  @action
  async toggleCandidate(candidate) {
    await this.args.toggleCandidate(candidate);
  }

  @action
  async authorizeTestResume(candidate) {
    await this.args.authorizeTestResume(candidate);
  }

  @action
  async endAssessmentByInvigilator(candidate) {
    await this.args.endAssessmentByInvigilator(candidate);
  }

  @action
  setFilter(event) {
    this.filter = event.target.value;
  }

  @action
  emptySearchInput() {
    this.filter = '';
  }

  <template>
    <div class='session-supervising-candidate-list-background'>
      {{#if @candidates}}
        <div class='session-supervising-candidate-list'>
          <h1 class='session-supervising-candidate-list__title'>{{t 'common.sessions.candidates'}}</h1>
          <p class='session-supervising-candidate-list__description'>{{t
              'pages.session-supervising.candidate-list.indicate-candidates-attendance'
            }}</p>
          <div class='session-supervising-candidate-list__search'>
            <PixIcon @name='search' @ariaHidden={{true}} class='search-icon' />
            <PixInput
              class='search-input'
              @id='search-candidate'
              @screenReaderOnly={{true}}
              placeholder={{t 'pages.session-supervising.candidate-list.search-candidate'}}
              @value={{this.filter}}
              {{on 'input' this.setFilter}}
            >
              <:label>{{t 'pages.session-supervising.candidate-list.search-candidate'}}</:label>
            </PixInput>
            <PixIconButton
              @ariaLabel={{t 'pages.session-supervising.candidate-list.clear-field'}}
              @iconName='close'
              @triggerAction={{this.emptySearchInput}}
              class='clear-button'
              @size={{true}}
            />
          </div>
          <p class='session-supervising-candidate-list__candidates-count'>
            {{t
              'pages.session-supervising.candidate-list.active-candidates'
              activeCandidates=this.activeCandidatesCount
              startedCandidates=this.startedCandidatesCount
              totalCandidates=@candidates.length
            }}
          </p>
          <ul class='session-supervising-candidate-list__candidates'>
            {{#each this.filteredCandidates as |candidate|}}
              <CandidateInList
                @candidate={{candidate}}
                @toggleCandidate={{this.toggleCandidate}}
                @onCandidateTestResumeAuthorization={{this.authorizeTestResume}}
                @onInvigilatorEndAssessment={{this.endAssessmentByInvigilator}}
                @sessionId={{@sessionId}}
                @hasSessionExpired={{@hasSessionExpired}}
              />
            {{/each}}
          </ul>
        </div>
      {{else}}
        {{! template-lint-disable no-redundant-role }}
        <img
          src='/session-supervising-empty-candidate-list.svg'
          class='session-supervising-candidate-list__empty-image'
          alt
          role='presentation'
        />
        <p class='session-supervising-candidate-list__empty-message'>{{t
            'pages.session-supervising.candidate-list.no-candidate'
          }}</p>
      {{/if}}
    </div>
  </template>
}
