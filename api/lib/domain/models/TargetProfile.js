const _ = require('lodash');

class TargetProfile {
  constructor({
    id,
    // attributes
    name,
    isPublic,
    outdated,
    // includes
    skills = [],
    // references
    organizationId,
    sharedWithOrganizationIds = [],
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.isPublic = isPublic;
    this.outdated = outdated;
    // includes
    this.skills = skills;
    // references
    this.organizationId = organizationId;
    this.sharedWithOrganizationIds = sharedWithOrganizationIds;
  }

  getSkillsInCompetence(competence) {
    const competenceSkillsKeyedById = _.map(competence.skills, (skill) => {
      return { id: skill };
    });
    return _.intersectionBy(this.skills, competenceSkillsKeyedById, 'id');
  }

  getKnowledgeElementsValidatedPercentage(knowledgeElements) {
    const totalValidatedSkills = _.sumBy(knowledgeElements, 'isValidated');
    return _.round(totalValidatedSkills / this.skills.length, 2);
  }
}

module.exports = TargetProfile;

