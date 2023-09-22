import { AreaForAdmin } from './index.js';

class TargetProfileForAdmin {
  constructor({
    id,
    name,
    outdated,
    isPublic,
    createdAt,
    ownerOrganizationId,
    description,
    comment,
    imageUrl,
    category,
    isSimplifiedAccess,
    areKnowledgeElementsResettable,
    hasLinkedCampaign,
    badges,
    stageCollection,
    areas = [],
    competences = [],
    thematics = [],
    tubes = [],
    skills = [],
  } = {}) {
    this.id = id;
    this.name = name;
    this.outdated = outdated;
    this.isPublic = isPublic;
    this.createdAt = createdAt;
    this.ownerOrganizationId = ownerOrganizationId;
    this.description = description;
    this.comment = comment;
    this.imageUrl = imageUrl;
    this.category = category;
    this.isSimplifiedAccess = isSimplifiedAccess;
    this.areKnowledgeElementsResettable = areKnowledgeElementsResettable;
    this.hasLinkedCampaign = hasLinkedCampaign;
    this.badges = badges;
    this.stageCollection = stageCollection;
    this.areas = areas.map(
      (area) =>
        new AreaForAdmin({
          id: area.id,
          frameworkId: area.frameworkId,
          title: area.title,
          code: area.code,
          color: area.color,
          allCompetences: competences,
          allThematics: thematics,
          allTubes: tubes,
          allSkills: skills,
        }),
    );
  }

  get cappedTubes() {
    return this.areas.flatMap((area) => area.getCappedTubes());
  }

  getContentAsJson(skills) {
    return JSON.stringify(this.areas.flatMap((area) => area.getTubesForContentJson(skills)));
  }

  get maxLevel() {
    const levels = this.areas.map((area) => area.maxLevel);
    return Math.max(...levels);
  }
}

export { TargetProfileForAdmin };
