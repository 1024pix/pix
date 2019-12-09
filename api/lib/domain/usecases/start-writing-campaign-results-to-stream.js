const moment = require('moment');
const bluebird = require('bluebird');
const csvService = require('../services/csv-service');
const { pipe, assign: addProperties } = require('lodash/fp');
const _ = require('lodash');

const {
  UserNotAuthorizedToGetCampaignResultsError,
  CampaignWithoutOrganizationError
} = require('../errors');

const headerPropertyMap = [
  {
    headerName: 'Nom de l\'organisation',
    propertyName: 'organizationName',
    type: csvService.valueTypes.TEXT,
  },
  {
    headerName: 'ID Campagne',
    propertyName: 'campaignId',
    type: csvService.valueTypes.NUMBER,
  },
];

async function _fetchUserIfHeHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  if (_.isNil(organizationId)) {
    throw new CampaignWithoutOrganizationError(`Campaign without organization : ${organizationId}`);
  }
  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(`User does not have an access to the organization ${organizationId}`);
  }
  return user;
}

function _cleanText(text) {
  return `${text.replace(/"/g, '')}`;
}

function createCsvHeader(enhancedTargetProfile, idPixLabel) {
  return _.concat(
    _getBaseHeaders(idPixLabel),
    _getCompetencesHeaders(enhancedTargetProfile.competences),
    _getAreasHeaders(enhancedTargetProfile.areas),
    _getSkillsHeaders(enhancedTargetProfile.skillNames),
  );
}

function _getBaseHeaders(idPixLabel) {
  return [
    'Nom de l\'organisation',
    'ID Campagne',
    'Nom de la campagne',
    'Nom du Profil Cible',
    'Nom du Participant',
    'Prénom du Participant',
    idPixLabel ? _cleanText(idPixLabel) : null,
    '% de progression',
    'Date de début',
    'Partage (O/N)',
    'Date du partage',
    '% maitrise de l\'ensemble des acquis du profil',
  ].filter(Boolean);
}

function _getCompetencesHeaders(competences) {
  return _.flatMap(competences, _getCompetenceHeaders);
}

function _getCompetenceHeaders(competence) {
  return [
    `% de maitrise des acquis de la compétence ${competence.name}`,
    `Nombre d'acquis du profil cible dans la compétence ${competence.name}`,
    `Acquis maitrisés dans la compétence ${competence.name}`,
  ];
}

function _getAreasHeaders(areas) {
  return _.flatMap(areas, _getAreaHeaders);
}

function _getAreaHeaders(area) {
  return [
    `% de maitrise des acquis du domaine ${area.title}`,
    `Nombre d'acquis du profil cible du domaine ${area.title}`,
    `Acquis maitrisés du domaine ${area.title}`,
  ];
}

function _getSkillsHeaders(skillNames) {
  return _.flatMap(skillNames, _getSkillHeaders);
}

function _getSkillHeaders(skillName) {
  return [
    `${skillName}`,
  ];
}

function _stateOfSkill(skillId, knowledgeElements) {
  const knowledgeElementForSkill = _.find(knowledgeElements, { skillId });
  if (knowledgeElementForSkill) {
    return knowledgeElementForSkill.isValidated ? 'OK' : 'KO';
  } else {
    return 'Non testé';
  }
}

function _getValidatedSkillsForCompetence(competenceSkills, knowledgeElements) {
  return _(knowledgeElements)
    .filter('isValidated')
    .filter(_knowledgeElementRelatedTo(competenceSkills))
    .size();
}

function _knowledgeElementRelatedTo(skills) {
  return (knowledgeElement) => _(skills).map('id').includes(knowledgeElement.skillId);
}

function _competenceRelatedTo(skillIds) {
  return (competence) => skillIds.some((skillId) => competence.skills.includes(skillId));
}

function _withSkill(headers, targetProfileKnowledgeElements, line) {
  return (skill) => {
    line = pipe(csvService.addTextCell(`${skill.name}`, _stateOfSkill(skill.id, targetProfileKnowledgeElements), headers))(line);
  };
}

function _withCompetence(headers, enhancedTargetProfile, line) {
  return (competence) => {
    const skillsForThisCompetence = enhancedTargetProfile.getSkillsInCompetence(competence);
    const numberOfSkillsValidatedForThisCompetence = _getValidatedSkillsForCompetence(skillsForThisCompetence, enhancedTargetProfile.knowledgeElements);
    const percentage = _.round(numberOfSkillsValidatedForThisCompetence / skillsForThisCompetence.length, 2);

    line = pipe(
      csvService.addNumberCell(`% de maitrise des acquis de la compétence ${competence.name}`, percentage, headers),
      csvService.addNumberCell(`Nombre d'acquis du profil cible dans la compétence ${competence.name}`, skillsForThisCompetence.length, headers),
      csvService.addNumberCell(`Acquis maitrisés dans la compétence ${competence.name}`, numberOfSkillsValidatedForThisCompetence, headers),
    )(line);

    // Add on Area
    const areaSkillsForThisCompetence = enhancedTargetProfile.areas.find((area) => area.title === competence.area.title);
    areaSkillsForThisCompetence.numberSkillsValidated = areaSkillsForThisCompetence.numberSkillsValidated + numberOfSkillsValidatedForThisCompetence;
    areaSkillsForThisCompetence.numberSkillsTested = areaSkillsForThisCompetence.numberSkillsTested + skillsForThisCompetence.length;
  };
}

function _withArea(headers, line) {
  return (area) => {
    const percentage = _.round(area.numberSkillsValidated / area.numberSkillsTested, 2);
    line = pipe(
      csvService.addNumberCell(`% de maitrise des acquis du domaine ${area.title}`, percentage, headers),
      csvService.addNumberCell(`Nombre d'acquis du profil cible du domaine ${area.title}`, area.numberSkillsTested, headers),
      csvService.addNumberCell(`Acquis maitrisés du domaine ${area.title}`, area.numberSkillsValidated, headers),
    )(line);
  };
}

function _withCampaign(campaign, campaignParticipation, headers) {
  return _toPipe(
    csvService.addTextCell('Nom de la campagne',campaign.name, headers),
    csvService.addTextCell('Partage (O/N)', campaignParticipation.isShared ? 'Oui' : 'Non', headers),
    campaign.idPixLabel ? csvService.addTextCell('' + _cleanText(campaign.idPixLabel) + '', campaignParticipation.participantExternalId, headers) : _.identity,
  );
}

function _withUser(user, headers) {
  return _toPipe(
    csvService.addTextCell('Nom du Participant', user.lastName, headers),
    csvService.addTextCell('Prénom du Participant', user.firstName, headers),
  );
}

function _withAssessment(assessment, progression, headers) {
  return _toPipe(
    csvService.addNumberCell('% de progression', (assessment.isCompleted) ? 1 : progression, headers),
    csvService.addNumberCell('Date de début', moment.utc(assessment.createdAt).format('YYYY-MM-DD'), headers),
  );
}

function _withTargetProfile(targetProfile, headers) {
  return csvService.addTextCell('Nom du Profil Cible', targetProfile.name, headers);
}

function _toPipe(...fns) {
  return (input) => {
    input = pipe(...fns)(input);
    return input;
  };
}

function _initLineWithPlaceholders(headers) {
  return headers.map(() => 'NA');
}

function enhanceTargetProfile(targetProfile, competences) {
  const enhancedTargetProfile = _.assign(targetProfile, {
    skillNames: _.map(targetProfile.skills, 'name'),
    skillIds: _.map(targetProfile.skills, 'id'),
  });
  enhancedTargetProfile.competences = competences.filter(_competenceRelatedTo(enhancedTargetProfile.skillIds));
  enhancedTargetProfile.areas = _(enhancedTargetProfile.competences).map('area').map(addProperties({ numberSkillsValidated: 0, numberSkillsTested: 0 })).value();
  return enhancedTargetProfile;
}

module.exports = async function startWritingCampaignResultsToStream(
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
    smartPlacementAssessmentRepository,
    knowledgeElementRepository,
  }) {

  const campaign = await campaignRepository.get(campaignId);

  const [user, targetProfile, competences, organization, listCampaignParticipation] = await Promise.all([
    _fetchUserIfHeHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository),
    targetProfileRepository.get(campaign.targetProfileId),
    competenceRepository.list(),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findByCampaignId(campaign.id),
  ]);

  const enhancedTargetProfile = enhanceTargetProfile(targetProfile, competences);

  const headers = createCsvHeader(enhancedTargetProfile, campaign.idPixLabel);
  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + csvService.getHeadersWithQuotes(headers).join(';') + '\n';

  writableStream.write(headerLine);
  bluebird.mapSeries(listCampaignParticipation, async (campaignParticipation) => {

    const [assessment, allKnowledgeElements] = await Promise.all([
      smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId),
      knowledgeElementRepository.findUniqByUserId({ userId: campaignParticipation.userId, limitDate: campaignParticipation.sharedAt })
    ]);

    enhancedTargetProfile.knowledgeElements = allKnowledgeElements.filter(_knowledgeElementRelatedTo(targetProfile.skills));

    let line = _initLineWithPlaceholders(headers);

    line = pipe(
      _withCampaign(campaign, campaignParticipation, headers),
      _withUser(user, headers),
      _withAssessment(assessment, enhancedTargetProfile.getProgression(allKnowledgeElements), headers),
      _withTargetProfile(enhancedTargetProfile, headers),
      campaignParticipation.isShared ? _withEndResults(campaignParticipation, enhancedTargetProfile, headers) : _.identity
    )(line);

    const rawData = {
      organizationName: organization.name,
      campaignId,
    };

    csvService.updateCsvLine({ line, rawData, headerPropertyMap });

    line = line.join(';') + '\n';

    writableStream.write(line);
  }).then(() => {
    writableStream.end();
  }).catch((error) => {
    writableStream.emit('error', error);
    throw error;
  });

  const fileName = `Resultats-${campaign.name}-${campaign.id}-${moment.utc().format('YYYY-MM-DD-hhmm')}.csv`;
  return { fileName };
};

function _withEndResults(campaignParticipation, enhancedTargetProfile, headers) {
  return (line) => {
    pipe(
      csvService.addNumberCell('Date du partage', moment.utc(campaignParticipation.sharedAt).format('YYYY-MM-DD'), headers),
      csvService.addNumberCell('Date du partage', moment.utc(campaignParticipation.sharedAt).format('YYYY-MM-DD'), headers),
      csvService.addNumberCell('% maitrise de l\'ensemble des acquis du profil', enhancedTargetProfile.getKnowledgeElementsValidatedPercentage(enhancedTargetProfile.knowledgeElements), headers),
    )(line);

    _.forEach(enhancedTargetProfile.competences, _withCompetence(headers, enhancedTargetProfile, line));
    _.forEach(enhancedTargetProfile.areas, _withArea(headers, line));
    _.forEach(enhancedTargetProfile.skills, _withSkill(headers, enhancedTargetProfile.knowledgeElements, line));

    return line;
  };
}
