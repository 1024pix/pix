export class TargetProfile {
  constructor({ id, name, category, isSimplifiedAccess, isPublic }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.isSimplifiedAccess = isSimplifiedAccess;
    this.isPublic = isPublic;
  }
}
