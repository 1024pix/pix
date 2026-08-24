import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import or from 'ember-truth-helpers/helpers/or';
import some from 'lodash/some';

import dayjsUtcFormat from '../helpers/dayjs-utc-format';

export default class AddStudentList extends Component {
  @service pixToast;
  @service store;
  @service router;
  @service intl;
  @service locale;

  emptyMessage = 'Aucune classe trouvée';

  @tracked selectedDivisions = [];

  constructor() {
    super(...arguments);
    this.selectedDivisions = this.args.selectedDivisions;
  }

  get isDisabled() {
    const areStudentsAllEnrolled = this.args.studentList.every((student) => student.isEnrolled);
    return !!areStudentsAllEnrolled;
  }

  get hasCheckState() {
    return this._hasCheckedSomething();
  }

  get hasPartialState() {
    return !this._hasCheckedEverything() && this._hasCheckedSomething();
  }

  get shouldDisableAddButton() {
    const hasAtLeastOneSelectedStudent = this.store.peekAll('student').some((student) => student.isSelected);
    return !hasAtLeastOneSelectedStudent;
  }

  get numberOfStudentsAlreadyCandidate() {
    return this.args.numberOfEnrolledStudents;
  }

  get showStickyBar() {
    const students = this.store.peekAll('student');
    const areStudentsEnrolledOrSelected = students.map((s) => s.isEnrolled || s.isSelected);
    return some(areStudentsEnrolledOrSelected);
  }

  get numberOfStudentsSelected() {
    const students = this.store.peekAll('student');
    const selectedStudents = students.filter((student) => student.isSelected);
    return selectedStudents.length;
  }

  @action
  toggleItem(item) {
    item.isSelected = !item.isSelected;
  }

  @action
  toggleAllItems(parentCheckbox) {
    let newState = true;
    if (this._hasCheckedEverything()) {
      newState = false;
    }
    this.args.studentList.forEach((student) => student.setSelected(newState));
    parentCheckbox.srcElement.checked = newState;
  }

  @action
  async enrolStudents() {
    const sessionId = this.args.session.id;
    const studentListToAdd = this.store.peekAll('student').filter((student) => student.isSelected);

    try {
      await this.args.session.save({ adapterOptions: { studentListToAdd, sessionId } });
      this.args.returnToSessionCandidates(sessionId);
      this.pixToast.sendSuccessNotification({ message: 'Le(s) candidat(s) ont été inscrit(s) avec succès.' });
    } catch (error) {
      let errorMessage = 'Une erreur est survenue au moment d‘inscrire les candidats.';
      const err = error?.errors?.[0];
      if (err?.code) {
        errorMessage = this.intl.t(`common.api-error-messages.${err.code}`, {
          ...err?.meta,
        });
      }
      if (error.errors?.[0]?.status === '422') errorMessage = error.errors?.[0]?.detail;
      this.pixToast.sendErrorNotification({ message: errorMessage });
    }
  }

  @action
  async selectDivision(divisions) {
    this.selectedDivisions = divisions;
    return this.router.replaceWith({ queryParams: { divisions } });
  }

  get _enrolableStudentList() {
    return this.args.studentList.filter(({ isEnrolled }) => !isEnrolled);
  }

  _hasCheckedEverything() {
    return this._enrolableStudentList.every(({ isSelected }) => isSelected);
  }

  _hasCheckedSomething() {
    const hasOneOrMoreCheck = this.args.studentList.some((student) => student.isSelected);
    return hasOneOrMoreCheck;
  }

  <template>
    {{#if @studentList}}

      <div class='add-student-list__filters'>
        <span>{{t 'pages.sco.enrol-candidates-in-session.list.table.filter.title'}}</span>
        <PixMultiSelect
          @emptyMessage={{this.emptyMessage}}
          @id='add-student-list__multi-select'
          @onChange={{this.selectDivision}}
          @placeholder={{t 'pages.sco.enrol-candidates-in-session.list.table.filter.placeholder'}}
          @isSearchable={{true}}
          @locale={{this.locale.currentLocale}}
          @screenReaderOnly={{true}}
          @values={{this.selectedDivisions}}
          @options={{@certificationCenterDivisions}}
        >
          <:label>{{t 'pages.sco.enrol-candidates-in-session.list.table.filter.extra-information'}}</:label>
          <:default as |option|>{{option.label}}</:default>
        </PixMultiSelect>
      </div>

      <PixTable @data={{@studentList}} @variant='certif'>
        <:columns as |student context|>
          <PixTableColumn @context={{context}}>
            <:header>
              <PixCheckbox
                @screenReaderOnly={{true}}
                @isIndeterminate={{this.hasPartialState}}
                @checked={{this.hasCheckState}}
                {{on 'click' this.toggleAllItems}}
                disabled={{this.isDisabled}}
              >
                <:label>{{t 'pages.candidates.add.actions.select-all.label'}}</:label>
              </PixCheckbox>
            </:header>
            <:cell>
              <PixCheckbox
                @screenReaderOnly={{true}}
                @checked={{or student.isSelected student.isEnrolled}}
                disabled={{student.isEnrolled}}
                {{on 'click' (fn this.toggleItem student)}}
              >
                <:label>
                  {{#if student.isEnrolled}}
                    {{t
                      'pages.candidates.add.actions.selected.label'
                      firstName=student.firstName
                      lastName=student.lastName
                    }}
                  {{else}}
                    {{t
                      'pages.candidates.add.actions.select.label'
                      firstName=student.firstName
                      lastName=student.lastName
                    }}
                  {{/if}}
                </:label>
              </PixCheckbox>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'pages.sco.enrol-candidates-in-session.list.table.division'}}
            </:header>
            <:cell>
              {{student.division}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'pages.sco.enrol-candidates-in-session.list.table.last-name'}}
            </:header>
            <:cell>
              {{student.lastName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'pages.sco.enrol-candidates-in-session.list.table.first-name'}}
            </:header>
            <:cell>
              {{student.firstName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'pages.sco.enrol-candidates-in-session.list.table.birthdate'}}
            </:header>
            <:cell>
              {{dayjsUtcFormat student.birthdate 'DD/MM/YYYY'}}
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>

      <PixPagination @pagination={{@studentList.meta}} />

      {{#if this.showStickyBar}}
        <div class='add-student-list__bottom-action-bar'>

          <div class='bottom-action-bar__information'>
            <p class='bottom-action-bar__information--candidates-selected'>
              {{#if this.numberOfStudentsSelected}}
                {{this.numberOfStudentsSelected}}
                {{t 'pages.sco.enrol-candidates-in-session.list.action-bar.candidate-selected'}}
              {{else}}
                {{t 'pages.sco.enrol-candidates-in-session.list.action-bar.no-candidate-selected'}}
              {{/if}}
            </p>
            <span class='bottom-action-bar__separator'></span>
            <p class='bottom-action-bar__information--candidates-already-added'>
              {{this.numberOfStudentsAlreadyCandidate}}
              {{t 'pages.sco.enrol-candidates-in-session.list.action-bar.candidate-already-enrolled'}}
            </p>
          </div>

          <div class='bottom-action-bar__actions'>
            <PixButtonLink
              @variant='secondary'
              @isBorderVisible={{true}}
              @route='authenticated.sessions.details.certification-candidates'
              @model={{@session.id}}
            >
              {{t 'common.actions.cancel'}}
            </PixButtonLink>
            <PixButton
              @triggerAction={{this.enrolStudents}}
              type='button'
              @isDisabled={{this.shouldDisableAddButton}}
              class='bottom-action-bar__actions--add-button'
            >
              Inscrire
            </PixButton>
          </div>
        </div>
      {{/if}}
    {{/if}}
  </template>
}
