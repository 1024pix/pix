import Model, { attr, belongsTo } from '@ember-data/model';
import { computed } from '@ember/object';

export default class Snapshot extends Model {

  // attributes
  @attr('string') campaignCode;
  @attr('date') createdAt;
  @attr('number') score;
  @attr('string') studentCode;
  @attr('string') testsFinished;

  // includes
  @belongsTo('organization') organization;
  @belongsTo('user') user;

  // methods
  @computed('testsFinished')
  get numberOfTestsFinished() {
    return this.testsFinished || 0;
  }
}
