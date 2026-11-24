export type RecommendedModuleArgs = {
  id?: number;
  moduleId: string;
  targetProfileIds: number[];
  campaignParticipationId?: number;
};

export class RecommendedModule {
  id?: number;
  moduleId: string;
  targetProfileIds: number[];
  campaignParticipationId?: number;

  constructor({ id, targetProfileIds, moduleId, campaignParticipationId }: RecommendedModuleArgs) {
    this.id = id;
    this.moduleId = moduleId;
    this.targetProfileIds = targetProfileIds;
    this.campaignParticipationId = campaignParticipationId;
  }
}
