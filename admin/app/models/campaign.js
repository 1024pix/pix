import Model, { attr } from '@ember-data/model';

export default class Campaign extends Model {
  @attr('string') name;
  @attr('date') archivedAt;
  @attr('string') type;
  @attr('string') code;
  @attr('date') createdAt;
  @attr('string') creatorLastName;
  @attr('string') creatorFirstName;
}
