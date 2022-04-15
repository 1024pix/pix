export interface IUserSavedTutorial {
  id: number;
  userId: number;
  tutorialId: string;
  skillId: string;
}

export class UserSavedTutorial {
  id: number;
  userId: number;
  tutorialId: string;
  skillId: string;
  constructor({ id, userId, tutorialId, skillId }: IUserSavedTutorial) {
    this.id = id;
    this.userId = userId;
    this.tutorialId = tutorialId;
    this.skillId = skillId;
  }
}
