export type RecommendedModuleArgs = {
  id?: number;
  moduleId: string;
  targetProfileIds: number[];
};

export class RecommendedModule {
  id?: number;
  moduleId: string;
  targetProfileIds: number[];

  constructor({ id, targetProfileIds, moduleId }: RecommendedModuleArgs) {
    this.id = id;
    this.moduleId = moduleId;
    this.targetProfileIds = targetProfileIds;
  }
}
