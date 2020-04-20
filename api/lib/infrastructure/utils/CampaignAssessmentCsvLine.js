const moment = require('moment');
const _ = require('lodash');

function _stateOfSkill(skillId, knowledgeElements) {
  const knowledgeElementForSkill = _.findLast(knowledgeElements,
    (knowledgeElement) => knowledgeElement.skillId === skillId);
  if (knowledgeElementForSkill) {
    return knowledgeElementForSkill.isValidated ? 'OK' : 'KO';
  } else {
    return 'Non testé';
  }
}

function _getSkillsOfCompetenceByTargetProfile(competence, targetProfile) {
  const skillsOfProfile = targetProfile.skills;
  const skillsOfCompetences = competence.skillIds;
  return skillsOfProfile
    .filter((skillOfProfile) => skillsOfCompetences.some((skill) => skill === skillOfProfile.id));
}

function _getSkillsValidatedForCompetence(skills, knowledgeElements) {
  const sumValidatedSkills = _.reduce(knowledgeElements, function(validatedSkill, knowledgeElement) {
    if (knowledgeElement.isValidated && skills.find((skill) => skill.id === knowledgeElement.skillId)) {
      return validatedSkill + 1;
    }
    return validatedSkill;
  }, 0);
  return sumValidatedSkills;

}

function _extractAreas(competences) {
  return _.uniqBy(competences.map((competence) => competence.area), 'code');
}

function _totalValidatedSkills(knowledgeElements) {
  const sumValidatedSkills = _.reduce(knowledgeElements, function(validatedSkill, knowledgeElement) {
    if (knowledgeElement.isValidated) {
      return validatedSkill + 1;
    }
    return validatedSkill;
  }, 0);
  return sumValidatedSkills;
}

function _percentageSkillsValidated(knowledgeElements, targetProfile) {
  return _.round(_totalValidatedSkills(knowledgeElements) / targetProfile.skills.length, 2);
}

class CampaignAssessmentCsvLine {
  constructor({
    organization,
    campaign,
    competences,
    campaignParticipationResultData,
    targetProfile,
    participantKnowledgeElements,
    campaignParticipationService,
  }) {

    this.organization = organization;
    this.campaign = campaign;
    this.competences = competences;
    this.campaignParticipationResultData = campaignParticipationResultData;
    this.targetProfile = targetProfile;
    this.participantKnowledgeElements = participantKnowledgeElements;
    this.isShared = campaignParticipationResultData.isShared;
    this.knowledgeElements = participantKnowledgeElements
      .filter((ke) => _.find(targetProfile.skills, { id: ke.skillId }));
    this.campaignParticipationService = campaignParticipationService;

    this._makeStatsColumns = this._makeStatsColumns.bind(this);
    this._makeAreaColumns  = this._makeAreaColumns.bind(this);
    this._makeCommonColumns = this._makeCommonColumns.bind(this);
    this._getStatsForCompetence = this._getStatsForCompetence.bind(this);
  }

  toCsvLine() {
    return [
      ...this._makeCommonColumns(),
      ...this._makeCompetenceColumns(),
      ...this._makeAreaColumns(),
      ..._.map(this.targetProfile.skills, ({ id }) => this.isShared ? _stateOfSkill(id, this.knowledgeElements) : 'NA')
    ];
  }

  _makeStatsColumns({ skillCount, validatedSkillCount }) {
    if (!this.isShared) return ['NA', 'NA', 'NA'];
    return [
      _.round(validatedSkillCount / skillCount, 2),
      skillCount,
      validatedSkillCount,
    ];
  }

  _getStatsForCompetence(competence) {
    const skillsForThisCompetence = _getSkillsOfCompetenceByTargetProfile(competence, this.targetProfile);
    return {
      skillCount: skillsForThisCompetence.length,
      validatedSkillCount: _getSkillsValidatedForCompetence(skillsForThisCompetence, this.knowledgeElements)
    };
  }

  _makeCompetenceColumns() {
    return _.flatMap(this.competences, (competence) => this._makeStatsColumns({
      id: competence.id,
      ...this._getStatsForCompetence(competence),
    }));
  }

  _makeAreaColumns() {
    const areas = _extractAreas(this.competences);
    return _.flatMap(areas, ({ id }) => {
      const areaCompetenceStats = _.filter(this.competences, (competence) => competence.area.id === id)
        .map(this._getStatsForCompetence);

      const skillCount = _.sumBy(areaCompetenceStats, 'skillCount');
      const validatedSkillCount = _.sumBy(areaCompetenceStats, 'validatedSkillCount');

      return this._makeStatsColumns({
        id,
        skillCount,
        validatedSkillCount,
      });
    });
  }

  _makeCommonColumns() {
    const { participantFirstName, participantLastName } = this.campaignParticipationResultData;
    return [
      this.organization.name,
      this.campaign.id,
      this.campaign.name,
      this.targetProfile.name,
      participantLastName,
      participantFirstName,
      this.campaign.idPixLabel ? this.campaignParticipationResultData.participantExternalId : 'NA',
      this.campaignParticipationService.progress(this.campaignParticipationResultData.isCompleted, this.knowledgeElements.length, this.targetProfile.skills.length),
      moment.utc(this.campaignParticipationResultData.createdAt).format('YYYY-MM-DD'),
      this.isShared ? 'Oui' : 'Non',
      this.isShared ? moment.utc(this.campaignParticipationResultData.sharedAt).format('YYYY-MM-DD') : 'NA',
      this.isShared ? _percentageSkillsValidated(this.knowledgeElements, this.targetProfile) : 'NA',
    ];
  }

}

module.exports = CampaignAssessmentCsvLine;
