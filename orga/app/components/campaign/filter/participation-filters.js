import times from 'lodash/times';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ParticipationFilters extends Component {
  @service intl;
  @service currentUser;

  get displayFilters() {
    return (
      this.displayStagesFilter ||
      this.displayBadgesFilter ||
      this.displayDivisionFilter ||
      this.displayStatusFilter ||
      this.displayGroupsFilter ||
      this.displaySearchFilter
    );
  }

  get displayStagesFilter() {
    const { isTypeAssessment, hasStages } = this.args.campaign;
    return !this.args.isHiddenStages && isTypeAssessment && hasStages;
  }

  get displayBadgesFilter() {
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
    const totalStage = this.args.campaign.stages.length;
    return this.args.campaign.stages.map((stage, index) => ({
      value: stage.id,
      reachedStage: index + 1,
      totalStage,
    }));
  }

  get badgeOptions() {
    return this.args.campaign?.badges?.map(({ id, title }) => ({ value: id, label: title }));
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
}
