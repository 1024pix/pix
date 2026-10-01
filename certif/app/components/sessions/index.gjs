import { PixButton, PixFilterBanner, PixInput, PixSelect } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { debounceTask } from 'ember-lifeline';
import ENV from 'pix-certif/config/environment';

import { CREATED, FINALIZED, PROCESSED } from '../../models/session-management';
import { SESSION_PAGE_SIZE } from '../../utils/pagination';
import NoSessionPanel from './no-session-panel';
import SessionList from './session-list';
import SessionListHeader from './session-list-header';

const SESSION_STATUSES = [CREATED, FINALIZED, PROCESSED];

const DEFAULT_PAGE_NUMBER = 1;

export default class Sessions extends Component {
  @service currentUser;
  @service intl;
  @service router;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = SESSION_PAGE_SIZE;
  @tracked sessionIdFilter = this.args.sessionId ?? null;
  @tracked selectedStatusFilter = this.args.status ?? this.statusFilterOptions[0].value;
  @tracked startDateFilter = this.args.startDate ?? null;
  @tracked endDateFilter = this.args.endDate ?? null;

  get sessionSummaries() {
    return this.args.sessionSummaries;
  }

  get statusFilterOptions() {
    const sessionStatusesOptions = SESSION_STATUSES.map((status) => ({
      value: status,
      label: this.intl.t(`pages.sessions.list.status.${status}`),
    }));

    return [{ value: 'all', label: this.intl.t(`pages.sessions.list.status.all`) }, ...sessionStatusesOptions];
  }

  get displayClearFilters() {
    return (
      !!this.sessionIdFilter ||
      this.selectedStatusFilter !== this.statusFilterOptions[0].value ||
      !!this.startDateFilter ||
      !!this.endDateFilter
    );
  }

  @action
  goToSessionDetails(session) {
    this.router.transitionTo('authenticated.sessions.details', session.id);
  }

  @action
  async handleStatusFilterChange(status) {
    this.selectedStatusFilter = status;
    this.router.transitionTo({ queryParams: { status: status !== 'all' ? status : null, pageNumber: 1 } });
  }

  @action
  handleSessionIdFilterChange(event) {
    this.sessionIdFilter = event.target.value;
    debounceTask(this, '_transitionWithSessionIdFilter', ENV.APP.DEBOUNCE_FILTER_DELAY);
  }

  _transitionWithSessionIdFilter() {
    this.router.transitionTo({ queryParams: { sessionId: this.sessionIdFilter || null, pageNumber: 1 } });
  }

  @action
  handleStartDateFilterChange(event) {
    this.startDateFilter = event.target.value;
    debounceTask(this, '_transitionWithStartDateFilter', ENV.APP.DEBOUNCE_FILTER_DELAY);
  }

  _transitionWithStartDateFilter() {
    this.router.transitionTo({ queryParams: { startDate: this.startDateFilter || null, pageNumber: 1 } });
  }

  @action
  handleEndDateFilterChange(event) {
    this.endDateFilter = event.target.value;
    debounceTask(this, '_transitionWithEndDateFilter', ENV.APP.DEBOUNCE_FILTER_DELAY);
  }

  _transitionWithEndDateFilter() {
    this.router.transitionTo({ queryParams: { endDate: this.endDateFilter || null, pageNumber: 1 } });
  }

  @action
  handleLoadFilters(e) {
    e.preventDefault();
  }

  @action
  handleClearFilters() {
    this.sessionIdFilter = null;
    this.selectedStatusFilter = 'all';
    this.startDateFilter = null;
    this.endDateFilter = null;

    this.router.transitionTo({
      queryParams: { sessionId: null, status: null, startDate: null, endDate: null, pageNumber: null },
    });
  }

  <template>
    <div class='session-list-page'>
      {{#if @sessionSummaries.meta.hasSessions}}
        <SessionListHeader />

        <PixFilterBanner
          @title={{t 'pages.sessions.list.filters.title'}}
          class='session-list-page__filters'
          aria-label={{t 'pages.sessions.list.filters.label'}}
          @onLoadFilters={{this.handleLoadFilters}}
        >
          <PixInput
            type='number'
            @value={{this.sessionIdFilter}}
            {{on 'input' this.handleSessionIdFilterChange}}
            @size='small'
          >
            <:label>{{t 'pages.sessions.list.filters.session-id.label'}}</:label>
          </PixInput>
          <PixSelect
            @options={{this.statusFilterOptions}}
            @value={{this.selectedStatusFilter}}
            @onChange={{this.handleStatusFilterChange}}
            @hideDefaultOption={{true}}
            @size='small'
          >
            <:label>{{t 'pages.sessions.list.filters.status.label'}}</:label>
          </PixSelect>
          <PixInput
            type='date'
            @value={{this.startDateFilter}}
            {{on 'change' this.handleStartDateFilterChange}}
            @size='small'
          >
            <:label>{{t 'pages.sessions.list.filters.start-date.label'}}</:label>
          </PixInput>
          <PixInput
            type='date'
            @value={{this.endDateFilter}}
            {{on 'change' this.handleEndDateFilterChange}}
            @size='small'
          >
            <:label>{{t 'pages.sessions.list.filters.end-date.label'}}</:label>
          </PixInput>
          {{#if this.displayClearFilters}}
            <PixButton
              class='session-list-page-filters__clear-button'
              @variant='tertiary'
              @iconBefore='delete'
              @size='small'
              @triggerAction={{this.handleClearFilters}}
            >
              {{t 'pages.sessions.list.filters.clear'}}
            </PixButton>
          {{/if}}
        </PixFilterBanner>

        <SessionList @sessionSummaries={{this.sessionSummaries}} @goToSessionDetails={{this.goToSessionDetails}} />
      {{else}}
        <NoSessionPanel />
      {{/if}}
    </div>
  </template>
}
