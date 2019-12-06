const moment = require('moment');
const bluebird = require('bluebird');
const csvService = require('../services/csv-service');
const { pipe, assign: addProperties } = require('lodash/fp');
const _ = require('lodash');

const { UserNotAuthorizedToGetCampaignResultsError, CampaignWithoutOrganizationError } = require('../errors');

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
  return `"${text.replace(/"/g, '""')}"`;
}

function createCsvHeader(skillNames, competences, areas, idPixLabel) {
  return _.concat(
    _getBaseHeaders(idPixLabel),
    _getCompetencesHeaders(competences),
    _getAreasHeaders(areas),
    _getSkillsHeaders(skillNames),
  );
}

function _getBaseHeaders(idPixLabel) {
  return [
    '"Nom de l\'organisation"',
    '"ID Campagne"',
    '"Nom de la campagne"',
    '"Nom du Profil Cible"',
    '"Nom du Participant"',
    '"Prénom du Participant"',
    idPixLabel ? _cleanText(idPixLabel) : null,
    '"% de progression"',
    '"Date de début"',
    '"Partage (O/N)"',
    '"Date du partage"',
    '"% maitrise de l\'ensemble des acquis du profil"',
  ].filter(Boolean);
}

function _getCompetencesHeaders(competences) {
  return _.flatMap(competences, _getCompetenceHeaders);
}

function _getCompetenceHeaders(competence) {
  return [
    `"% de maitrise des acquis de la compétence ${competence.name}"`,
    `"Nombre d'acquis du profil cible dans la compétence ${competence.name}"`,
    `"Acquis maitrisés dans la compétence ${competence.name}"`,
  ];
}

function _getAreasHeaders(areas) {
  return _.flatMap(areas, _getAreaHeaders);
}

function _getAreaHeaders(area) {
  return [
    `"% de maitrise des acquis du domaine ${area.title}"`,
    `"Nombre d'acquis du profil cible du domaine ${area.title}"`,
    `"Acquis maitrisés du domaine ${area.title}"`,
  ];
}

function _getSkillsHeaders(skillNames) {
  return _.flatMap(skillNames, _getSkillHeaders);
}

function _getSkillHeaders(skillName) {
  return [
    `"${skillName}"`,
  ];
}

function _addNumberCell(title, data, headers) {
  return (line) => {
    line[headers.indexOf(title)] = csvService.toCsvNumber(data);
    return line;
  };
}

function _addTextCell(title, data, headers) {
  return (line) => {
    line[headers.indexOf(title)] = csvService.toCsvText(data);
    return line;
  };
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

function _withSkill(headers, knowledgeElementsInTargetProfile, line) {
  return (skill) => {
    line = pipe(_addTextCell(`"${skill.name}"`, _stateOfSkill(skill.id, knowledgeElementsInTargetProfile), headers))(line);
  };
}

function _withCompetence(headers, targetProfile, knowledgeElementsInTargetProfile, areaSkills, line) {
  return (competence) => {
    const skillsForThisCompetence = targetProfile.getSkillsInCompetence(competence);
    const numberOfSkillsValidatedForThisCompetence = _getValidatedSkillsForCompetence(skillsForThisCompetence, knowledgeElementsInTargetProfile);
    const percentage = _.round(numberOfSkillsValidatedForThisCompetence / skillsForThisCompetence.length, 2);

    line = pipe(
      _addNumberCell(`"% de maitrise des acquis de la compétence ${competence.name}"`, percentage, headers),
      _addNumberCell(`"Nombre d'acquis du profil cible dans la compétence ${competence.name}"`, skillsForThisCompetence.length, headers),
      _addNumberCell(`"Acquis maitrisés dans la compétence ${competence.name}"`, numberOfSkillsValidatedForThisCompetence, headers),
    )(line);

    // Add on Area
    const areaSkillsForThisCompetence = areaSkills.find((area) => area.title === competence.area.title);
    areaSkillsForThisCompetence.numberSkillsValidated = areaSkillsForThisCompetence.numberSkillsValidated + numberOfSkillsValidatedForThisCompetence;
    areaSkillsForThisCompetence.numberSkillsTested = areaSkillsForThisCompetence.numberSkillsTested + skillsForThisCompetence.length;
  };
}

function _withArea(headers, line) {
  return (area) => {
    const percentage = _.round(area.numberSkillsValidated / area.numberSkillsTested, 2);
    line = pipe(
      _addNumberCell(`"% de maitrise des acquis du domaine ${area.title}"`, percentage, headers),
      _addNumberCell(`"Nombre d'acquis du profil cible du domaine ${area.title}"`, area.numberSkillsTested, headers),
      _addNumberCell(`"Acquis maitrisés du domaine ${area.title}"`, area.numberSkillsValidated, headers),
    )(line);
  };
}

function _withCampaign(campaign, campaignParticipation, headers) {
  return _toPipe(
    _addNumberCell('"ID Campagne"', campaign.id, headers),
    _addTextCell('"Nom de la campagne"',campaign.name, headers),
    _addTextCell('"Partage (O/N)"', campaignParticipation.isShared ? 'Oui' : 'Non', headers),
    campaign.idPixLabel ? _addTextCell(_cleanText(campaign.idPixLabel), campaignParticipation.participantExternalId, headers) : _.identity,
  );
}

function _withOrganization(organization, headers) {
  return _addTextCell('"Nom de l\'organisation"', organization.name, headers);
}

function _withUser(user, headers) {
  return _toPipe(
    _addTextCell('"Nom du Participant"', user.lastName, headers),
    _addTextCell('"Prénom du Participant"', user.firstName, headers),
  );
}

function _withAssessment(assessment, progression, headers) {
  return _toPipe(
    _addNumberCell('"% de progression"', (assessment.isCompleted) ? 1 : progression, headers),
    _addNumberCell('"Date de début"', moment.utc(assessment.createdAt).format('YYYY-MM-DD'), headers),
  );
}

function _withTargetProfile(targetProfile, headers) {
  return _addTextCell('"Nom du Profil Cible"', targetProfile.name, headers);
}

function _toPipe(...fns) {
  return (input) => {
    input = pipe(...fns)(input);
    return input;
  };
}

function _initLineWithPlaceholders(headers) {
  return headers.map(() => '"NA"');
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

  const [user, targetProfile, listAllCompetences, organization, listCampaignParticipation] = await Promise.all([
    _fetchUserIfHeHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository),
    targetProfileRepository.get(campaign.targetProfileId),
    competenceRepository.list(),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findByCampaignId(campaign.id),
  ]);

  const targetProfileSkillNames = _.map(targetProfile.skills, 'name');
  const targetProfileSkillIds = _.map(targetProfile.skills, 'id');
  const targetProfileCompetences = listAllCompetences.filter(_competenceRelatedTo(targetProfileSkillIds));
  const targetProfileAreas = _(targetProfileCompetences).map('area').value();
  const targetProfileAreasWithSkills = targetProfileAreas.map(addProperties({ numberSkillsValidated: 0, numberSkillsTested: 0 }));

  const headers = createCsvHeader(targetProfileSkillNames, targetProfileCompetences, targetProfileAreas, campaign.idPixLabel);

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + headers.join(';') + '\n';

  writableStream.write(headerLine);
  bluebird.mapSeries(listCampaignParticipation, async (campaignParticipation) => {

    const [assessment, allKnowledgeElements] = await Promise.all([
      smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId),
      knowledgeElementRepository.findUniqByUserId({ userId: campaignParticipation.userId, limitDate: campaignParticipation.sharedAt })
    ]);

    const knowledgeElementsInTargetProfile = allKnowledgeElements.filter(_knowledgeElementRelatedTo(targetProfile.skills));

    let line = pipe(
      _initLineWithPlaceholders,

      _withCampaign(campaign, campaignParticipation, headers),
      _withOrganization(organization, headers),
      _withUser(user, headers),
      _withAssessment(assessment, targetProfile.getProgression(allKnowledgeElements), headers),
      _withTargetProfile(targetProfile, headers),

      campaignParticipation.isShared
        ? _withEndResults(
          campaignParticipation,
          targetProfile,
          targetProfileCompetences,
          targetProfileAreasWithSkills,
          knowledgeElementsInTargetProfile,
          headers)
        : _.identity
    )(headers);

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

function _withEndResults(campaignParticipation, targetProfile, targetProfileCompetences, targetProfileAreasWithSkills, knowledgeElementsInTargetProfile, headers) {
  return (line) => {
    pipe(
      _addNumberCell('"Date du partage"', moment.utc(campaignParticipation.sharedAt).format('YYYY-MM-DD'), headers),
      _addNumberCell('"Date du partage"', moment.utc(campaignParticipation.sharedAt).format('YYYY-MM-DD'), headers),
      _addNumberCell('"% maitrise de l\'ensemble des acquis du profil"', targetProfile.getKnowledgeElementsValidatedPercentage(knowledgeElementsInTargetProfile), headers),
    )(line);
    
    _.forEach(targetProfileCompetences, _withCompetence(headers, targetProfile, knowledgeElementsInTargetProfile, targetProfileAreasWithSkills, line));
    _.forEach(targetProfileAreasWithSkills, _withArea(headers, line));
    _.forEach(targetProfile.skills, _withSkill(headers, knowledgeElementsInTargetProfile, line));

    return line;
  };
}
