import DS from 'ember-data';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import domainColors from 'pix-orga/static-data/domain-colors';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  name: attr('string'),
  index: attr('string'),
  totalSkillsCount: attr('number'),
  testedSkillsCount: attr('number'),
  validatedSkillsCount: attr('number'),
  campaignParticipationResult: belongsTo('campaignParticipationResult'),

  totalSkillsCountPercentage: computed('totalSkillsCount', 'campaignParticipationResult.maxTotalSkillsCountInCompetences', function() {
    return Math.round(this.totalSkillsCount * 100 / this.campaignParticipationResult.get('maxTotalSkillsCountInCompetences'));
  }),

  validatedSkillsPercentage: computed('validatedSkillsCount', 'totalSkillsCount', function() {
    return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
  }),

  domainColorStyle: computed('index', function() {
    const domainIndex = this.index.charAt(0);
    const foundDomain = domainColors.find((colors) => colors.domain === domainIndex) || 'black';
    return htmlSafe(`color: ${foundDomain.color}`);
  }),
});
