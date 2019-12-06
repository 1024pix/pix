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

  getProgression(knowledgeElements) {
    const knowledgeElementsInTargetProfile = knowledgeElements.filter(_knowledgeElementRelatedTo(this.skills));
    return _.round(knowledgeElementsInTargetProfile.length / (this.skills.length), 3,);
  }
}

function _knowledgeElementRelatedTo(skills) {
  return (knowledgeElement) => _(skills).map('id').includes(knowledgeElement.skillId);
}

module.exports = TargetProfile;

