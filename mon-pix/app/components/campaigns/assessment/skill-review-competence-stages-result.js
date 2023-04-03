import Component from '@glimmer/component';

export default class SkillReviewCompetenceStagesResult extends Component {
  get total() {
    return this.args.totalStage - 1;
  }
}
