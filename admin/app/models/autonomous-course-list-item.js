import Model, { attr } from '@ember-data/model';

export default class AutonomousCourseListItem extends Model {
  @attr('string') name;
  @attr('date') createdAt;
  @attr('date') archivedAt;
}
