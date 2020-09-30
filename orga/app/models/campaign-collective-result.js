import DS from 'ember-data';
import maxBy from 'lodash/maxBy';
import sum from 'lodash/sum';
import sumBy from 'lodash/sumBy';
const { Model, hasMany } = DS;

export default class CampaignCollectiveResult extends Model {

  @hasMany('campaignCompetenceCollectiveResult') campaignCompetenceCollectiveResults;

  get maxTotalSkillsCountInCompetences() {
    return maxBy(this.campaignCompetenceCollectiveResults.toArray(), 'targetedSkillsCount').targetedSkillsCount;
  }

  get averageValidatedSkillsSum() {
    const roundedAverageResults = this.campaignCompetenceCollectiveResults.map((campaignCompetenceCollectiveResult) => {
      return Math.round(campaignCompetenceCollectiveResult.averageValidatedSkills * 10) / 10;
    });
    return Math.round(sum(roundedAverageResults) * 10) / 10;
  }

  get totalSkills() {
    return sumBy(this.campaignCompetenceCollectiveResults.toArray(), 'targetedSkillsCount');
  }

  get averageResult() {
    return Math.round(this.averageValidatedSkillsSum * 100 / this.totalSkills);
  }
}
