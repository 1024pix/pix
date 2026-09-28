export type RecommendedModuleType = {
  id?: number;
  moduleId: string;
  targetProfileIds: number[];
};

export class RecommendedModule {
  id?: number;
  moduleId: string;
  targetProfileIds: number[];

  constructor({ id, targetProfileIds, moduleId }: RecommendedModuleType) {
    this.id = id;
    this.moduleId = moduleId;
    this.targetProfileIds = targetProfileIds;
  }
}
