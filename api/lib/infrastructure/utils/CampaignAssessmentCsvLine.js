const moment = require('moment');
const _ = require('lodash');

const STATS_COLUMNS_COUNT = 3;
const EMPTY_CONTENT = 'NA';

class CampaignAssessmentCsvLine {
  constructor({
    organization,
    campaign,
    competences,
    campaignParticipationInfo,
    targetProfile,
    participantKnowledgeElements,
    campaignParticipationService,
  }) {

    this.organization = organization;
    this.campaign = campaign;
    this.competences = competences;
    this.campaignParticipationInfo = campaignParticipationInfo;
    this.targetProfile = targetProfile;
    const targetedKnowledgeElements = participantKnowledgeElements
      .filter((ke) => targetProfile.hasSkill(ke.skillId));
    this.targetedKnowledgeElementsCount = targetedKnowledgeElements.length;
    this.targetedKnowledgeElementsByCompetence = _.groupBy(targetedKnowledgeElements, 'competenceId');
    this.campaignParticipationService = campaignParticipationService;

    // To have the good `this` in _getStatsForCompetence, it is necessary to bind it
    this._getStatsForCompetence = this._getStatsForCompetence.bind(this);
  }

  toCsvLine() {
    return [
      ...this._makeCommonColumns(),
      ...(this.campaignParticipationInfo.isShared ? this._makeSharedColumns() : this._makeNotSharedColumns()),
    ];
  }

  _makeSharedStatsColumns({ targetedSkillCount, validatedSkillCount }) {
    return [
      _.round(validatedSkillCount / targetedSkillCount, 2),
      targetedSkillCount,
      validatedSkillCount,
    ];
  }

  _makeNotSharedStatsColumns(times) {
    return _.times(times, () => EMPTY_CONTENT);
  }

  _getStatsForCompetence(competence) {
    const skillsForThisCompetence = this._getSkillsOfCompetenceByTargetProfile(competence);
    return {
      targetedSkillCount: skillsForThisCompetence.length,
      validatedSkillCount: this._countValidatedKnowledgeElementsForCompetence(competence.id),
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

      const targetedSkillCount = _.sumBy(areaCompetenceStats, 'targetedSkillCount');
      const validatedSkillCount = _.sumBy(areaCompetenceStats, 'validatedSkillCount');

      return this._makeSharedStatsColumns({
        id,
        targetedSkillCount,
        validatedSkillCount,
      });
    });
  }

  _makeCommonColumns() {

    return [
      this.organization.name,
      this.campaign.id,
      this.campaign.name,
      this.targetProfile.name,
      this.campaignParticipationInfo.participantLastName,
      this.campaignParticipationInfo.participantFirstName,
      ...this._studentNumber,
      ...(this.campaign.idPixLabel ? [this.campaignParticipationInfo.participantExternalId] : []),
      this.campaignParticipationService.progress(this.campaignParticipationInfo.isCompleted, this.targetedKnowledgeElementsCount, this.targetProfile.skills.length),
      moment.utc(this.campaignParticipationInfo.createdAt).format('YYYY-MM-DD'),
      this.campaignParticipationInfo.isShared ? 'Oui' : 'Non',
      this.campaignParticipationInfo.isShared ? moment.utc(this.campaignParticipationInfo.sharedAt).format('YYYY-MM-DD') : EMPTY_CONTENT,
      this.campaignParticipationInfo.isShared ? this._percentageSkillsValidated() : EMPTY_CONTENT,
    ];
  }

  _makeSharedColumns() {
    return [
      ...this._makeCompetenceColumns(),
      ...this._makeAreaColumns(),
      ..._.map(this.targetProfile.skills, ({ competenceId, id }) => this._stateOfSkill(competenceId, id)),
    ];
  }

  _makeNotSharedColumns() {
    const areas = this._extractAreas(this.competences);
    return [
      ...this._makeNotSharedStatsColumns(this.competences.length * STATS_COLUMNS_COUNT),
      ...this._makeNotSharedStatsColumns(areas.length * STATS_COLUMNS_COUNT),
      ...this._makeNotSharedStatsColumns(this.targetProfile.skills.length),
    ];
  }

  _stateOfSkill(competenceId, skillId) {
    const knowledgeElementForSkill = _.find(this.targetedKnowledgeElementsByCompetence[competenceId],
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

  _countValidatedKnowledgeElementsForCompetence(competenceId) {
    return this.targetedKnowledgeElementsByCompetence[competenceId]
      .filter((knowledgeElement) => knowledgeElement.isValidated)
      .length;
  }

  _extractAreas() {
    return _.uniqBy(this.competences.map((competence) => competence.area), 'code');
  }

  _countValidatedKnowledgeElements() {
    return _.sum(_.map(this.targetedKnowledgeElementsByCompetence, (knowledgeElements) => {
      return knowledgeElements.filter((knowledgeElement) => knowledgeElement.isValidated)
        .length;
    }));
  }

  _percentageSkillsValidated() {
    return _.round(this._countValidatedKnowledgeElements() / this.targetProfile.skills.length, 2);
  }

  get _studentNumber() {
    let studentNumber = null;
    if (this.organization.type == 'SUP' && this.organization.isManagingStudents) {
      studentNumber = this.campaignParticipationInfo.studentNumber || '';
    }
    return [studentNumber].filter((value) => value != null);
  }
}

module.exports = CampaignAssessmentCsvLine;
