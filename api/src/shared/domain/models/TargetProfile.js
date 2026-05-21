const categories = {
  COMPETENCES: 'COMPETENCES',
  CUSTOM: 'CUSTOM',
  DISCIPLINE: 'DISCIPLINE',
  OTHER: 'OTHER',
  PIX_PLUS: 'PIX_PLUS',
  PREDEFINED: 'PREDEFINED',
  SUBJECT: 'SUBJECT',
  TARGETED: 'TARGETED',
  BACK_TO_SCHOOL: 'BACK_TO_SCHOOL',
};

class TargetProfile {
  constructor({
    id,
    name,
    internalName,
    imageUrl,
    category,
    isSimplifiedAccess,
    outdated,
    stages,
    badges,
    description,
  } = {}) {
    this.id = id;
    this.name = name;
    this.internalName = internalName;
    this.imageUrl = imageUrl;
    this.category = category;
    this.isSimplifiedAccess = isSimplifiedAccess;
    this.outdated = outdated;
    this.stages = stages;
    this.badges = badges;
    this.description = description;
  }

  get hasBadges() {
    return !!this.badges && this.badges.length > 0;
  }
}

TargetProfile.categories = categories;

export { categories, TargetProfile };
