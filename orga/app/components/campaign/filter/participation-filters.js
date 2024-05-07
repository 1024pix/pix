import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

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
}
