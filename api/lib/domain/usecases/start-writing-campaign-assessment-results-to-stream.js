const campaignParticipationService = require('../services/campaign-participation-service');

const _ = require('lodash');
const moment = require('moment');
const bluebird = require('bluebird');

const { UserNotAuthorizedToGetCampaignResultsError, CampaignWithoutOrganizationError } = require('../errors');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');

module.exports = async function startWritingCampaignAssessmentResultsToStream(
  {
    userId,
    campaignId,
    writableStream,
    campaignRepository,
    userRepository,
    targetProfileRepository,
    competenceRepository,
    campaignParticipationRepository,
    organizationRepository,
    knowledgeElementRepository,
  }) {

  const campaign = await campaignRepository.get(campaignId);

  await _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);

  const [targetProfile, allCompetences, organization, campaignParticipationResultDatas] = await Promise.all([
    targetProfileRepository.get(campaign.targetProfileId),
    competenceRepository.list(),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findAssessmentResultDataByCampaignId(campaign.id),
  ]);

  const competences = _extractCompetences(allCompetences, targetProfile.skills);

  //Create HEADER of CSV
  const headers = _createHeaderOfCSV(targetProfile.skills, competences, campaign.idPixLabel);

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + csvSerializer.serializeLine(headers);

  writableStream.write(headerLine);

  // No return/await here, we need the writing to continue in the background
  // after this function's returned promise resolves. If we await the mapSeries
  // function, node will keep all the data in memory until the end of the
  // complete operation.
  bluebird.mapSeries(campaignParticipationResultDatas, async (campaignParticipationResultData) => {
    const participantKnowledgeElements = await knowledgeElementRepository.findUniqByUserId({
      userId: campaignParticipationResultData.userId,
      limitDate: campaignParticipationResultData.sharedAt,
    });

    const csvLine = _createOneLineOfCSV({
      organization,
      campaign,
      competences,
      campaignParticipationResultData,
      targetProfile,
      participantKnowledgeElements,
    });

    writableStream.write(csvLine);
  }).then(() => {
    writableStream.end();
  }).catch((error) => {
    writableStream.emit('error', error);
    throw error;
  });

  const fileName = `Resultats-${campaign.name}-${campaign.id}-${moment.utc().format('YYYY-MM-DD-hhmm')}.csv`;
  return { fileName };
};

async function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  if (_.isNil(organizationId)) {
    throw new CampaignWithoutOrganizationError(`Campaign without organization : ${organizationId}`);
  }

  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(
      `User does not have an access to the organization ${organizationId}`
    );
  }
}

function _createHeaderOfCSV(skills, competences, idPixLabel) {
  const areas = _extractAreas(competences);

  return [
    'Nom de l\'organisation',
    'ID Campagne',
    'Nom de la campagne',
    'Nom du Profil Cible',
    'Nom du Participant',
    'Prénom du Participant',

    ...(idPixLabel ? [idPixLabel] : []),

    '% de progression',
    'Date de début',
    'Partage (O/N)',
    'Date du partage',
    '% maitrise de l\'ensemble des acquis du profil',

    ...(_.flatMap(competences, (competence) => [
      `% de maitrise des acquis de la compétence ${competence.name}`,
      `Nombre d'acquis du profil cible dans la compétence ${competence.name}`,
      `Acquis maitrisés dans la compétence ${competence.name}`,
    ])),

    ...(_.flatMap(areas, (area) => [
      `% de maitrise des acquis du domaine ${area.title}`,
      `Nombre d'acquis du profil cible du domaine ${area.title}`,
      `Acquis maitrisés du domaine ${area.title}`,
    ])),

    ...(_.map(skills, 'name')),
  ];
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

function _createOneLineOfCSV({
  organization,
  campaign,
  competences,
  campaignParticipationResultData,
  targetProfile,
  participantKnowledgeElements,
}) {
  const line = new CsvLine({
    organization,
    campaign,
    competences,
    campaignParticipationResultData,
    targetProfile,
    participantKnowledgeElements,
  });

  return csvSerializer.serializeLine(line.toCsvLine());
}

function _extractCompetences(allCompetences, skills) {
  return _(skills)
    .map('competenceId')
    .uniq()
    .map((competenceId) => {
      const competence = _.find(allCompetences, { id: competenceId });
      if (!competence) {
        throw new Error(`Unknown competence ${competenceId}`);
      }
      return competence;
    })
    .value();
}

function _extractAreas(competences) {
  return _.uniqBy(competences.map((competence) => competence.area), 'code');
}

class CsvLine {
  constructor({
    organization,
    campaign,
    competences,
    campaignParticipationResultData,
    targetProfile,
    participantKnowledgeElements,
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
      campaignParticipationService.progress(this.campaignParticipationResultData.isCompleted, this.knowledgeElements.length, this.targetProfile.skills.length),
      moment.utc(this.campaignParticipationResultData.createdAt).format('YYYY-MM-DD'),
      this.isShared ? 'Oui' : 'Non',
      this.isShared ? moment.utc(this.campaignParticipationResultData.sharedAt).format('YYYY-MM-DD') : 'NA',
      this.isShared ? _percentageSkillsValidated(this.knowledgeElements, this.targetProfile) : 'NA',
    ];
  }

}
