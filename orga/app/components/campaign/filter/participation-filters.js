import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ParticipationFilters extends Component {
  @service currentUser;

  get displayFilters() {
    return (
      this.displayStagesFilter || this.displayBadgesFilter || this.displayDivisionFilter || this.displayStatusFilter
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
    return this.isDivisionsLoaded && this.currentUser.isSCOManagingStudents;
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

  get isDivisionsLoaded() {
    return this.args.campaign?.divisions?.content?.length > 0;
  }

  get divisionOptions() {
    return this.args.campaign?.divisions?.map(({ name }) => ({ value: name, label: name }));
  }

  get statusOptions() {
    return [
      { value: 'STARTED', label: 'Démarrée' },
      { value: 'TO_SHARE', label: 'A partager' },
      { value: 'SHARED', label: 'Partagée' },
    ];
  }

  @action
  onSelectStage(stages) {
    this.args.onFilter({ stages });
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
