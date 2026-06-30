export const COURSE_ITEM_TYPES = {
  TARGET_PROFILE: 'targetProfile',
  BLUEPRINT: 'blueprint',
};

export class CourseItem {
  constructor({ id, name, type, nbTubes, nbModules, category, isSimplifiedAccess, areas, createdAt }) {
    this.id = id;
    this.createdAt = createdAt ?? null;
    this.name = name;
    this.type = type;
    this.nbTubes = nbTubes ?? null;
    this.nbModules = nbModules ?? null;
    this.category = category ?? null;
    this.isSimplifiedAccess = isSimplifiedAccess ?? null;
    this.areas = areas ?? [];
  }
}
