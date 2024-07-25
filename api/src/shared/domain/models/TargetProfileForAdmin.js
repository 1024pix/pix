import { DomainError } from '../errors.js';
import { AreaForAdmin } from './index.js';
import { categories } from './TargetProfile.js';

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
    hasLinkedAutonomousCourse,
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
    this.hasLinkedAutonomousCourse = hasLinkedAutonomousCourse;
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

  update(attributes) {
    const hasTubeToUpdate = attributes.tubes?.length > 0;

    if (hasTubeToUpdate && this.hasLinkedCampaign) {
      throw new DomainError('Le profil cible est relié à une campagne, interdiction de modifier le référentiel');
    }

    const validCategories = Object.values(categories);
    if (!validCategories.includes(attributes.category)) {
      throw new DomainError("La catégorie de profil cible renseignée n'est pas valide");
    }

    this.name = attributes.name;
    this.imageUrl = attributes.imageUrl;
    this.description = attributes.description;
    this.comment = attributes.comment;
    this.category = attributes.category;
    this.areKnowledgeElementsResettable = attributes.areKnowledgeElementsResettable;
    this.tubes = attributes.tubes;
  }
}

export { TargetProfileForAdmin };
