/**
 * A migrated user's displayed score on one competence.
 *
 * One instance mirrors one row of the `competence-scores` table.
 * The score is seeded from the user's knowledge elements when they are migrated and only
 * ever raised afterward.
 * A reset of competence deletes the row.
 */
export type CompetenceScoreType = {
  userId: number;
  competenceId: string;
  pix?: number;
  updatedAt?: Date;
};

export class CompetenceScore {
  userId: number;
  competenceId: string;
  pix: number;
  updatedAt: Date | undefined;

  constructor({ userId, competenceId, pix = 0, updatedAt }: CompetenceScoreType) {
    this.userId = userId;
    this.competenceId = competenceId;
    this.pix = pix;
    this.updatedAt = updatedAt;
  }
}
