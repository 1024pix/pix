import DS from 'ember-data';
import { computed } from '@ember/object';

const { Model, attr, belongsTo } = DS;
const MAX_REACHABLE_TOTAL_PIX = 640;

export default Model.extend({
  birthdate: attr('date'),
  birthplace: attr('string'),
  firstName: attr('string'),
  lastName: attr('string'),
  date: attr('date'),
  certificationCenter: attr('string'),
  isPublished: attr('boolean'),
  pixScore: attr('number'),
  status: attr('string'),
  user: belongsTo('user'),
  commentForCandidate: attr('string'),
  resultCompetenceTree: belongsTo('resultCompetenceTree'),
  certifiedPixScore: computed('pixScore', function() {
    return Math.min(this.pixScore, MAX_REACHABLE_TOTAL_PIX);
  }),

});
