const categories = {
  OTHER: 'OTHER',
  COMPETENCES: 'COMPETENCES',
  SUBJECT: 'SUBJECT',
  DISCIPLINE: 'DISCIPLINE',
  CUSTOM: 'CUSTOM',
  PREDEFINED: 'PREDEFINED',
};

class TargetProfile {
  constructor({
    id,
    name,
    imageUrl,
    isPublic,
    isSimplifiedAccess,
    outdated,
    stages,
    badges,
    ownerOrganizationId,
    description,
  } = {}) {
    this.id = id;
    this.name = name;
    this.imageUrl = imageUrl;
    this.isPublic = isPublic;
    this.isSimplifiedAccess = isSimplifiedAccess;
    this.outdated = outdated;
    this.stages = stages;
    this.badges = badges;
    this.ownerOrganizationId = ownerOrganizationId;
    this.description = description;
    this.organizationsAttached = [];
  }

  get hasBadges() {
    return !!this.badges && this.badges.length > 0;
  }

  get organizations() {
    return this.organizationsAttached;
  }
}

TargetProfile.categories = categories;

export { TargetProfile, categories };
