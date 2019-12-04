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

function _createOneLineOfCSV(
  headers,
  organization,
  campaign,
  listCompetences,
  listArea,
  campaignParticipation,
  targetProfile,
  user,
  assessment,
  allKnowledgeElements,
) {
  let line = headers.map(() => '"NA"');

  const knowledgeElements = allKnowledgeElements.filter((ke) => targetProfile.skills.find((skill) => skill.id === ke.skillId));
  const notCompletedPercentageProgression = _.round(knowledgeElements.length / (targetProfile.skills.length), 3,);
  const percentageProgression = (assessment.isCompleted) ? 1 : notCompletedPercentageProgression;
  const textForParticipationShared = campaignParticipation.isShared ? 'Oui' : 'Non';

  line = pipe(
    _addTextCell('"Nom de l\'organisation"', organization.name, headers),
    _addNumberCell('"ID Campagne"', campaign.id, headers),
    _addTextCell('"Nom de la campagne"',campaign.name, headers),
    _addTextCell('"Nom du Profil Cible"', targetProfile.name, headers),
    _addTextCell('"Nom du Participant"', user.lastName, headers),
    _addTextCell('"Prénom du Participant"', user.firstName, headers),
    campaign.idPixLabel ? _addTextCell(_cleanText(campaign.idPixLabel), campaignParticipation.participantExternalId, headers) : _.identity,
    _addNumberCell('"% de progression"', percentageProgression, headers),
    _addNumberCell('"Date de début"', moment.utc(assessment.createdAt).format('YYYY-MM-DD'), headers),
    _addTextCell('"Partage (O/N)"', textForParticipationShared, headers),
  )(line);

  if (assessment.isCompleted && campaignParticipation.isShared) {
    line = pipe(
      _addNumberCell('"Date du partage"', moment.utc(campaignParticipation.sharedAt).format('YYYY-MM-DD'), headers),
      _addNumberCell('"Date du partage"', moment.utc(campaignParticipation.sharedAt).format('YYYY-MM-DD'), headers),
      _addNumberCell('"% maitrise de l\'ensemble des acquis du profil"', targetProfile.getKnowledgeElementsValidatedPercentage(knowledgeElements), headers),
    )(line);

    const areaSkills = listArea.map(addProperties({ numberSkillsValidated: 0, numberSkillsTested: 0 }));

    // By Competences
    _.forEach(listCompetences, (competence) => {
      const skillsForThisCompetence = targetProfile.getSkillsInCompetence(competence);
      const numberOfSkillsValidatedForThisCompetence = _getValidatedSkillsForCompetence(skillsForThisCompetence, knowledgeElements);
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
    });

    // By Area
    _.forEach(areaSkills, (area) => {
      const percentage = _.round(area.numberSkillsValidated / area.numberSkillsTested, 2);

      line = pipe(
        _addNumberCell(`"% de maitrise des acquis du domaine ${area.title}"`, percentage, headers),
        _addNumberCell(`"Nombre d'acquis du profil cible du domaine ${area.title}"`, area.numberSkillsTested, headers),
        _addNumberCell(`"Acquis maitrisés du domaine ${area.title}"`, area.numberSkillsValidated, headers),
      )(line);

    });

    // By Skills
    _.forEach(targetProfile.skills, (skill) => {
      line = pipe(_addTextCell(`"${skill.name}"`, _stateOfSkill(skill.id, knowledgeElements), headers))(line);
    });
  }
  return line.join(';') + '\n';
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

  const listSkillsName = targetProfile.skills.map((skill) => skill.name);
  const listSkillsId = targetProfile.skills.map((skill) => skill.id);

  const listCompetences = listAllCompetences.filter((competence) => {
    return listSkillsId.some((skillId) => competence.skills.includes(skillId));
  });

  const listArea = _.uniqBy(listCompetences.map((competence) => competence.area), 'code');

  const headersAsArray = createCsvHeader(listSkillsName, listCompetences, listArea, campaign.idPixLabel);

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + headersAsArray.join(';') + '\n';

  writableStream.write(headerLine);

  bluebird.mapSeries(listCampaignParticipation, async (campaignParticipation) => {

    const [assessment, allKnowledgeElements] = await Promise.all([
      smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId),
      knowledgeElementRepository.findUniqByUserId({ userId: campaignParticipation.userId, limitDate: campaignParticipation.sharedAt })
    ]);

    const csvLine = _createOneLineOfCSV(
      headersAsArray,
      organization,
      campaign,
      listCompetences,
      listArea,
      campaignParticipation,
      targetProfile,
      user,
      assessment,
      allKnowledgeElements,
    );

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
