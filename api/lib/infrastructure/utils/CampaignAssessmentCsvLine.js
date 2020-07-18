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
    participantKnowledgeElementsByCompetenceId,
    campaignParticipationService,
  }) {

    this.organization = organization;
    this.campaign = campaign;
    this.competences = competences;
    this.campaignParticipationResultData = campaignParticipationResultData;
    this.targetProfile = targetProfile;
    this.isShared = campaignParticipationResultData.isShared;
    this.campaignParticipationService = campaignParticipationService;

    const competenceIds = _.map(competences, 'id');
    const competenceIdsKnowledgeElements = _.keys(participantKnowledgeElementsByCompetenceId);
    const competenceIdsNotInTargetProfile = _.difference(competenceIdsKnowledgeElements, competenceIds);
    const participantKnowledgeElementsByCompetenceIdClone = _.clone(participantKnowledgeElementsByCompetenceId);
    for (const competenceIdNotInTargetProfile of competenceIdsNotInTargetProfile) {
      delete participantKnowledgeElementsByCompetenceIdClone[competenceIdNotInTargetProfile];
    }
    this.knowledgeElementsByCompetenceId = _.mapValues(participantKnowledgeElementsByCompetenceIdClone, (knowledgeElementsInCompetence) => {
      return knowledgeElementsInCompetence.filter((ke) => _.find(targetProfile.skills, { id: ke.skillId }));
    });

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
      validatedSkillCount: this._countValidatedKnowledgeElementsForCompetence(competence)
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
      ...(this.campaign.idPixLabel ? [this.campaignParticipationResultData.participantExternalId] : []),
      this.campaignParticipationService.progress(this.campaignParticipationResultData.isCompleted, _.sumBy(_.values(this.knowledgeElementsByCompetenceId), 'length'), this.targetProfile.skills.length),
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
      ..._.map(this.targetProfile.skills, ({ id, competenceId }) => this._stateOfSkill(competenceId, id))
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

  _stateOfSkill(competenceId, skillId) {
    const knowledgeElementsForCompetence = _.get(this.knowledgeElementsByCompetenceId, competenceId);
    if (knowledgeElementsForCompetence) {
      const knowledgeElementForSkill = _.find(knowledgeElementsForCompetence, { skillId });
      if (knowledgeElementForSkill) {
        return knowledgeElementForSkill.isValidated ? 'OK' : 'KO';
      }
    }
    return 'Non testé';
  }

  _getSkillsOfCompetenceByTargetProfile(competence) {
    const skillsOfProfile = this.targetProfile.skills;
    const skillsOfCompetences = competence.skillIds;
    return skillsOfProfile
      .filter((skillOfProfile) => skillsOfCompetences.includes(skillOfProfile.id));
  }

  _countValidatedKnowledgeElementsForCompetence(competence) {
    const knowledgeElementsForCompetence = _.get(this.knowledgeElementsByCompetenceId, competence.id);
    if (!knowledgeElementsForCompetence) {
      return 0;
    }
    return knowledgeElementsForCompetence
      .filter((knowledgeElement) => knowledgeElement.isValidated)
      .length;
  }

  _extractAreas() {
    return _.uniqBy(this.competences.map((competence) => competence.area), 'code');
  }

  _countValidatedKnowledgeElements() {
    return _.sumBy(_.values(this.knowledgeElementsByCompetenceId), (knowledgeElements) => {
      return knowledgeElements.filter((knowledgeElement) => knowledgeElement.isValidated).length;
    });
  }

  _percentageSkillsValidated() {
    return _.round(this._countValidatedKnowledgeElements() / this.targetProfile.skills.length, 2);
  }

}

module.exports = CampaignAssessmentCsvLine;
