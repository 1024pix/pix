import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixStars from '@1024pix/pix-ui/components/pix-stars';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import DivisionsFilter from '../../ui/divisions-filter';
import GroupsFilter from '../../ui/groups-filter';
import SearchInputFilter from '../../ui/search-input-filter';

export default class ParticipationFilters extends Component {
  @service intl;
  @service currentUser;

  @tracked stages = [];
  @tracked isStagesLoading = true;
  @tracked badges = [];
  @tracked isBadgesLoading = true;

  constructor() {
    super(...arguments);
    Promise.resolve(this.args.campaign.stages).then((stages) => {
      this.stages = stages;
      this.isStagesLoading = false;
    });
    Promise.resolve(this.args.campaign.badges).then((badges) => {
      this.badges = badges;
      this.isBadgesLoading = false;
    });
  }

  get certificabilityOptions() {
    return [
      {
        value: 'eligible',
        label: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible'),
      },
      {
        value: 'non-eligible',
        label: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.non-eligible'),
      },
    ];
  }

  get isClearFiltersButtonDisabled() {
    return (
      !this.args.selectedStatus &&
      (!this.displaySearchFilter || !this.args.searchFilter) &&
      (!this.displayDivisionFilter || this.args.selectedDivisions.length === 0) &&
      (!this.displayGroupsFilter || this.args.selectedGroups.length === 0) &&
      (!this.displayStagesFilter || this.args.selectedStages.length === 0) &&
      (!this.displayBadgesFilter || this.args.selectedBadges.length === 0) &&
      (!this.displayCertificabilityFilter || !this.args.selectedCertificability)
    );
  }

  get displayFilters() {
    return (
      this.displayStagesFilter ||
      this.displayBadgesFilter ||
      this.displayDivisionFilter ||
      this.displayStatusFilter ||
      this.displayGroupsFilter ||
      this.displayCertificabilityFilter ||
      this.displaySearchFilter
    );
  }

  get displayCertificabilityFilter() {
    const { isTypeAssessment } = this.args.campaign;
    return !isTypeAssessment && !this.args.isHiddenCertificability;
  }

  get displayStagesFilter() {
    if (this.isStagesLoading) return false;
    const { isTypeAssessment, hasStages } = this.args.campaign;
    return !this.args.isHiddenStages && isTypeAssessment && hasStages;
  }

  get displayBadgesFilter() {
    if (this.isBadgesLoading) return false;
    const { isTypeAssessment, hasBadges } = this.args.campaign;
    return !this.args.isHiddenBadges && isTypeAssessment && hasBadges;
  }

  get displayDivisionFilter() {
    return this.currentUser.isSCOManagingStudents;
  }

  get displayGroupsFilter() {
    return this.currentUser.isSUPManagingStudents && !this.args.isHiddenGroup;
  }

  get displayStatusFilter() {
    return !this.args.isHiddenStatus;
  }

  get displaySearchFilter() {
    return !this.args.isHiddenSearch;
  }

  get stageOptions() {
    const totalStage = this.stages.length - 1;
    return this.stages.map((stage, index) => ({
      value: stage.id,
      reachedStage: index,
      totalStage,
      label: this.intl.t('common.result.stages', { count: index, total: totalStage }),
    }));
  }

  get badgeOptions() {
    return this.badges.map(({ id, title }) => ({ value: id, label: title }));
  }

  get statusOptions() {
    const { isTypeAssessment, type } = this.args.campaign;

    const statuses = isTypeAssessment ? ['STARTED', 'TO_SHARE', 'SHARED'] : ['TO_SHARE', 'SHARED'];

    return statuses.map((status) => {
      const label = this.intl.t(`components.participation-status.${status}-${type}`);
      return { value: status, label };
    });
  }

  @action
  onSelectStage(stages) {
    this.args.onFilter('stages', stages);
  }

  @action
  onSelectGroup(groups) {
    this.args.onFilter('groups', groups);
  }

  @action
  onSelectStatus(status) {
    this.args.onFilter('status', status);
  }

  @action
  onSelectBadge(badges) {
    this.args.onFilter('badges', badges);
  }

  @action
  onSelectDivision(divisions) {
    this.args.onFilter('divisions', divisions);
  }

  @action
  onSelectCertificability(certificability) {
    this.args.onFilter('certificability', certificability);
  }

  <template>
    {{#if this.displayFilters}}
      <PixFilterBanner
        @title={{t "common.filters.title"}}
        class="participant-filter-banner hide-on-mobile"
        aria-label={{t "pages.campaign-results.filters.aria-label"}}
        @details={{t "pages.campaign-results.filters.participations-count" count=@rowCount}}
        @clearFiltersLabel={{t "common.filters.actions.clear"}}
        @onClearFilters={{@onResetFilter}}
        @isClearFilterButtonDisabled={{this.isClearFiltersButtonDisabled}}
      >
        {{#if this.displayStatusFilter}}
          <PixSelect
            @screenReaderOnly={{true}}
            @options={{this.statusOptions}}
            @onChange={{this.onSelectStatus}}
            @value={{@selectedStatus}}
            @placeholder={{t "pages.campaign-results.filters.type.status.empty"}}
            @hideDefaultOption={{false}}
          >
            <:label>{{t "pages.campaign-results.filters.type.status.title"}}</:label>
          </PixSelect>
        {{/if}}
        {{#if this.displayDivisionFilter}}
          <DivisionsFilter @model={{@campaign}} @selected={{@selectedDivisions}} @onSelect={{this.onSelectDivision}} />
        {{/if}}
        {{#if this.displayGroupsFilter}}
          <GroupsFilter @campaign={{@campaign}} @onSelect={{this.onSelectGroup}} @selectedGroups={{@selectedGroups}} />
        {{/if}}
        {{#if this.displaySearchFilter}}
          <SearchInputFilter
            @field="search"
            @value={{@searchFilter}}
            @placeholder={{t "pages.campaign-results.filters.type.search.placeholder"}}
            @label={{t "pages.campaign-results.filters.type.search.title"}}
            @triggerFiltering={{@onFilter}}
          />
        {{/if}}
        {{#if this.displayStagesFilter}}
          <PixMultiSelect
            @placeholder={{t "pages.campaign-results.filters.type.stages"}}
            @screenReaderOnly={{true}}
            @onChange={{this.onSelectStage}}
            @values={{@selectedStages}}
            @options={{this.stageOptions}}
            @className="participant-filter-banner__stages-select"
          >
            <:label>{{t "pages.campaign-results.filters.type.stages"}}</:label>
            <:default as |stage|>
              <PixStars
                @count={{stage.reachedStage}}
                @total={{stage.totalStage}}
                @alt={{stage.label}}
                @color="blue"
                class="participant-filter-banner__stars"
              />
            </:default>
          </PixMultiSelect>
        {{/if}}
        {{#if this.displayBadgesFilter}}
          <PixMultiSelect
            @placeholder={{t "pages.campaign-results.filters.type.badges"}}
            @screenReaderOnly={{true}}
            @onChange={{this.onSelectBadge}}
            @values={{@selectedBadges}}
            @options={{this.badgeOptions}}
            @className="participant-filter-banner__badges"
          >
            <:label>{{t "pages.campaign-results.filters.type.badges"}}</:label>
            <:default as |badge|>{{badge.label}}</:default>
          </PixMultiSelect>
        {{/if}}
        {{#if this.displayCertificabilityFilter}}
          <PixSelect
            @options={{this.certificabilityOptions}}
            @value={{@selectedCertificability}}
            @onChange={{this.onSelectCertificability}}
            @screenReaderOnly={{true}}
            @placeholder={{t "components.certificability.placeholder-select"}}
          >
            <:label>{{t "pages.sco-organization-participants.filter.certificability.label"}}</:label>
          </PixSelect>
        {{/if}}
      </PixFilterBanner>
    {{/if}}
  </template>
}
