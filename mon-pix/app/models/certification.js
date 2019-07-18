import DS from 'ember-data';
import { computed } from '@ember/object';
import constants from 'mon-pix/static-data/constants-pix-and-level';

const { Model, attr, belongsTo } = DS;

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
    return Math.min(this.pixScore, constants.MAX_REACHABLE_TOTAL_PIX);
  }),

});
