import DS from 'ember-data';
import { computed } from '@ember/object';
const { hasMany, Model } = DS;
import _ from 'lodash';

import { round, computePercentage } from '../utils/math';

export default class CampaignCollectiveResult extends Model {

  @hasMany('campaignCompetenceCollectiveResult')
  campaignCompetenceCollectiveResults;

  @hasMany('campaignTubeCollectiveResult')
  campaignTubeCollectiveResults;

  // -- Computed properties --

  @computed('campaignCompetenceCollectiveResults.@each.totalSkillsCount')
  get maxTotalSkillsCountInCompetences() {
    return _.maxBy(this.campaignCompetenceCollectiveResults.toArray(), 'totalSkillsCount').totalSkillsCount;
  }

  @computed('campaignTubeCollectiveResults.@each.totalSkillsCount')
  get maxTotalSkillsCountInTubes() {
    return _.maxBy(this.campaignTubeCollectiveResults.toArray(), 'totalSkillsCount').totalSkillsCount;
  }

  @computed('campaignCompetenceCollectiveResults.@each.averageValidatedSkills')
  get averageValidatedSkillsSumByCompetence() {
    const roundedAverageResults = this.campaignCompetenceCollectiveResults.map((campaignCompetenceCollectiveResult) => {
      return round(campaignCompetenceCollectiveResult.averageValidatedSkills);
    });
    return _.sum(roundedAverageResults);
  }

  @computed('campaignTubeCollectiveResults.@each.averageValidatedSkills')
  get averageValidatedSkillsSumByTube() {
    const roundedAverageResults = this.campaignTubeCollectiveResults.map((campaignTubeCollectiveResult) => {
      return round(campaignTubeCollectiveResult.averageValidatedSkills);
    });
    return _.sum(roundedAverageResults);
  }

  @computed('campaignCompetenceCollectiveResults.@each.totalSkillsCount')
  get totalSkillsByCompetence() {
    return _.sumBy(this.campaignCompetenceCollectiveResults.toArray(), 'totalSkillsCount');
  }

  @computed('campaignTubeCollectiveResults.@each.totalSkillsCount')
  get totalSkillsByTube() {
    return _.sumBy(this.campaignTubeCollectiveResults.toArray(), 'totalSkillsCount');
  }

  @computed('averageValidatedSkillsSumByCompetence', 'totalSkillsByCompetence')
  get averageResultByCompetence() {
    return computePercentage(this.averageValidatedSkillsSumByCompetence, this.totalSkillsByCompetence);
  }

  @computed('averageValidatedSkillsSumByTube', 'totalSkillsByTube')
  get averageResultByTube() {
    return computePercentage(this.averageValidatedSkillsSumByTube, this.totalSkillsByTube);
  }
}
