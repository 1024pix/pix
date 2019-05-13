import DS from 'ember-data';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import domainColors from 'pix-orga/static-data/domain-colors';
const { belongsTo, Model, attr } = DS;

export default Model.extend({
  domainCode: attr('string'),
  competenceName: attr('string'),
  competenceId: attr('string'),
  averageValidatedSkills: attr('number'),
  totalSkillsCount: attr('number'),
  campaignCollectiveResult: belongsTo('campaign-collective-result'),

  roundedAverageValidatedSkills: computed('averageValidatedSkills', function() {
    return Math.round(this.averageValidatedSkills);
  }).readOnly(),

  averageValidatedSkillsPercentage: computed('averageValidatedSkills', 'totalSkillsCount', function() {
    return Math.round(this.averageValidatedSkills * 100 / this.totalSkillsCount);
  }).readOnly(),

  domainColorStyle: computed('domainCode', function() {
    const foundDomain = domainColors.find((colors) => colors.domain === this.domainCode);
    return htmlSafe(`color: ${foundDomain.color}`);
  }).readOnly(),

});
