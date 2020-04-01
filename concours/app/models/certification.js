import Model, { belongsTo, attr } from '@ember-data/model';

export default class Certification extends Model {

  // attributes
  @attr('date-only') birthdate;
  @attr('string') birthplace;
  @attr('string') certificationCenter;
  @attr('string') commentForCandidate;
  @attr('date') date;
  @attr('string') firstName;
  @attr('boolean') isPublished;
  @attr('string') lastName;
  @attr('number') pixScore;
  @attr('string') status;

  // includes
  @belongsTo('resultCompetenceTree') resultCompetenceTree;
  @belongsTo('user') user;
}
