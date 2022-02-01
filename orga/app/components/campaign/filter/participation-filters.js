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
      this.displayGroupsFilter
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

  get stageOptions() {
    return this.args.campaign?.stages?.map(({ id, threshold }) => ({ value: id, threshold }));
  }

  get badgeOptions() {
    return this.args.campaign?.badges?.map(({ id, title }) => ({ value: id, label: title }));
  }

  get statusOptions() {
    const { isTypeAssessment } = this.args.campaign;

    const statuses = isTypeAssessment ? ['STARTED', 'TO_SHARE', 'SHARED'] : ['TO_SHARE', 'SHARED'];

    return statuses.map((status) => {
      const type = isTypeAssessment ? 'assessment' : 'profile';
      const label = this.intl.t(`pages.campaign-activity.status.${status}-${type}`);
      return { value: status, label };
    });
  }

  @action
  onSelectStage(stages) {
    this.args.onFilter({ stages });
  }

  @action
  onSelectGroup(groups) {
    this.args.onFilter({ groups });
  }

  @action
  onSelectStatus(e) {
    this.args.onFilter({ status: e.target.value });
  }

  @action
  onSelectBadge(badges) {
    this.args.onFilter({ badges });
  }

  @action
  onSelectDivision(divisions) {
    this.args.onFilter({ divisions });
  }
}
