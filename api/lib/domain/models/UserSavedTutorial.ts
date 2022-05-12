export class UserSavedTutorial {
  createdAt: any;
  id: any;
  skillId: any;
  tutorialId: any;
  userId: any;
  constructor({ id, userId, tutorialId, skillId, createdAt }: any = {}) {
    this.id = id;
    this.userId = userId;
    this.tutorialId = tutorialId;
    this.skillId = skillId;
    this.createdAt = createdAt;
  }
}
