export type UserCompetenceScoreType = {
  userId: number;
  competenceId: string;
  pix?: number;
  updatedAt?: Date;
};

export class UserCompetenceScore {
  userId: number;
  competenceId: string;
  pix: number;
  updatedAt: Date;

  constructor({ userId, competenceId, pix = 0, updatedAt = new Date() }: UserCompetenceScoreType) {
    this.userId = userId;
    this.competenceId = competenceId;
    this.pix = pix;
    this.updatedAt = updatedAt;
  }
}
