import DS from 'ember-data';
import { computed } from '@ember/object';
import areaColors from 'mon-pix/static-data/area-colors';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  name: attr('string'),
  index: attr('string'),
  totalSkillsCount: attr('number'),
  testedSkillsCount: attr('number'),
  validatedSkillsCount: attr('number'),
  campaignParticipationResult: belongsTo('campaignParticipationResult'),

  totalSkillsCountPercentage: computed('totalSkillsCount', 'campaignParticipationResult', function() {
    return Math.round(this.totalSkillsCount * 100 / this.campaignParticipationResult.get('maxTotalSkillsCountInCompetences'));
  }),

  validatedSkillsPercentage: computed('validatedSkillsCount', 'totalSkillsCount', function() {
    return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
  }),

  areaColor: computed('index', function() {
    const areaIndex = this.index.charAt(0);
    const foundArea = areaColors.find((colors) => colors.area === areaIndex) || 'black';
    return foundArea.color;
  }),
});
