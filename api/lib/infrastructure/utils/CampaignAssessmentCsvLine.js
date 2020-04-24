const moment = require('moment');
const _ = require('lodash');

const STATS_COLUMNS_COUNT = 3;
const EMPTY_CONTENT = 'NA';

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
    this.isShared = campaignParticipationResultData.isShared;
    this.knowledgeElements = participantKnowledgeElements
      .filter((ke) => _.find(targetProfile.skills, { id: ke.skillId }));
    this.campaignParticipationService = campaignParticipationService;

    // To have the good `this` in _getStatsForCompetence, it is necessary to bind it
    this._getStatsForCompetence = this._getStatsForCompetence.bind(this);
  }

  toCsvLine() {
    return [
      ...this._makeCommonColumns(),
      ...(this.isShared ? this._makeSharedColumns() : this._makeNotSharedColumns())
    ];
  }

  _makeSharedStatsColumns({ skillCount, validatedSkillCount }) {
    return [
      _.round(validatedSkillCount / skillCount, 2),
      skillCount,
      validatedSkillCount,
    ];
  }

  _makeNotSharedStatsColumns(times) {
    return _.times(times, () => EMPTY_CONTENT);
  }

  _getStatsForCompetence(competence) {
    const skillsForThisCompetence = this._getSkillsOfCompetenceByTargetProfile(competence);
    return {
      skillCount: skillsForThisCompetence.length,
      validatedSkillCount: this._countValidatedKnowledgeElementsForSkills(skillsForThisCompetence)
    };
  }

  _makeCompetenceColumns() {
    return _.flatMap(this.competences, (competence) => this._makeSharedStatsColumns({
      id: competence.id,
      ...this._getStatsForCompetence(competence),
    }));
  }

  _makeAreaColumns() {
    const areas = this._extractAreas();
    return _.flatMap(areas, ({ id }) => {
      const areaCompetenceStats = _.filter(this.competences, (competence) => competence.area.id === id)
        .map(this._getStatsForCompetence);

      const skillCount = _.sumBy(areaCompetenceStats, 'skillCount');
      const validatedSkillCount = _.sumBy(areaCompetenceStats, 'validatedSkillCount');

      return this._makeSharedStatsColumns({
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
      this.campaign.idPixLabel ? this.campaignParticipationResultData.participantExternalId : EMPTY_CONTENT,
      this.campaignParticipationService.progress(this.campaignParticipationResultData.isCompleted, this.knowledgeElements.length, this.targetProfile.skills.length),
      moment.utc(this.campaignParticipationResultData.createdAt).format('YYYY-MM-DD'),
      this.isShared ? 'Oui' : 'Non',
      this.isShared ? moment.utc(this.campaignParticipationResultData.sharedAt).format('YYYY-MM-DD') : EMPTY_CONTENT,
      this.isShared ? this._percentageSkillsValidated() : EMPTY_CONTENT,
    ];
  }

  _makeSharedColumns() {
    return [
      ...this._makeCompetenceColumns(),
      ...this._makeAreaColumns(),
      ..._.map(this.targetProfile.skills, ({ id }) => this._stateOfSkill(id))
    ];
  }

  _makeNotSharedColumns() {
    const areas = this._extractAreas(this.competences);
    return [
      ...this._makeNotSharedStatsColumns(this.competences.length * STATS_COLUMNS_COUNT),
      ...this._makeNotSharedStatsColumns(areas.length * STATS_COLUMNS_COUNT),
      ...this._makeNotSharedStatsColumns(this.targetProfile.skills.length)
    ];
  }

  _stateOfSkill(skillId) {
    const knowledgeElementForSkill = _.findLast(this.knowledgeElements,
      (knowledgeElement) => knowledgeElement.skillId === skillId);
    if (knowledgeElementForSkill) {
      return knowledgeElementForSkill.isValidated ? 'OK' : 'KO';
    } else {
      return 'Non testé';
    }
  }

  _getSkillsOfCompetenceByTargetProfile(competence) {
    const skillsOfProfile = this.targetProfile.skills;
    const skillsOfCompetences = competence.skillIds;
    return skillsOfProfile
      .filter((skillOfProfile) => skillsOfCompetences.includes(skillOfProfile.id));
  }

  _countValidatedKnowledgeElementsForSkills(skills) {
    return this.knowledgeElements
      .filter((knowledgeElement) => knowledgeElement.isValidated &&
        skills.some((skill) => skill.id === knowledgeElement.skillId))
      .length;
  }

  _extractAreas() {
    return _.uniqBy(this.competences.map((competence) => competence.area), 'code');
  }

  _countValidatedKnowledgeElements() {
    return this.knowledgeElements
      .filter((knowledgeElement) => knowledgeElement.isValidated)
      .length;
  }

  _percentageSkillsValidated() {
    return _.round(this._countValidatedKnowledgeElements() / this.targetProfile.skills.length, 2);
  }

}

module.exports = CampaignAssessmentCsvLine;
