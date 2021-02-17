import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ParticipationFilters extends Component {
  @service currentUser;

  get displayFilters() {
    return this.displayStagesFilter || this.displayBadgesFilter || this.displayDivisionFilter;
  }

  get displayStagesFilter() {
    const { isTypeAssessment, hasStages } = this.args.campaign;
    return isTypeAssessment && hasStages;
  }

  get stageOptions() {
    return this.args.campaign.stages.map(({ id, threshold }) => ({ value: id, threshold }));
  }

  @action
  onSelectStage(stages) {
    this.args.triggerFiltering({ stages });
  }

  get displayBadgesFilter() {
    const { isTypeAssessment, hasBadges } = this.args.campaign;
    return isTypeAssessment && hasBadges;
  }

  get badgeOptions() {
    return this.args.campaign.badges.map(({ id, title }) => ({ value: id, label: title }));
  }

  @action
  onSelectBadge(badges) {
    this.args.triggerFiltering({ badges });
  }

  get isDivisionsLoaded() {
    return this.args.campaign.divisions.content.isLoaded;
  }

  get displayDivisionFilter() {
    return this.isDivisionsLoaded && this.currentUser.isSCOManagingStudents;
  }

  get divisionOptions() {
    return this.args.campaign.divisions.map(({ name }) => ({ value: name, label: name }));
  }

  @action
  onSelectDivision(divisions) {
    this.args.triggerFiltering({ divisions });
  }
}
