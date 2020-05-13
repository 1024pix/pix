import Model, { attr } from '@ember-data/model';

export default class JuryCertificationSummary extends Model {

  @attr() firstName;
  @attr() lastName;
  @attr() status;
  @attr() pixScore;
  @attr() createdAt;
  @attr() completedAt;
  @attr() isPublished;
  @attr() examinerComment;
  @attr() hasSeenEndTestScreen;
}
