const _ = require('lodash');
const moment = require('moment');
const bluebird = require('bluebird');

const { UserNotAuthorizedToGetCampaignResultsError, CampaignWithoutOrganizationError } = require('../errors');
const csvService = require('../services/csv-service');

const propertiesToSanitize = [
  'campaignName', 'targetProfileName',
  'participantLastName', 'participantFirstName', 'participantExternalId'
];

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

function _csvSerializeValue(data) {
  if (typeof data === 'number') {
    return data.toString().replace(/\./, ',');
  } else if (typeof data === 'string') {
    if (/^[0-9-]+$/.test(data)) {
      return data;
    } else {
      return `"${data.replace(/"/g, '""')}"`;
    }
  } else {
    throw new Error(`Unknown value type in _csvSerializeValue: ${typeof data}: ${data}`);
  }
}

function _csvSerializeLine(line) {
  return line.map(_csvSerializeValue).join(';') + '\n';
}

function _createHeaderOfCSV(skills, competences, areas, idPixLabel) {
  return [
    { title: 'Nom de l\'organisation', property: 'organizationName' },
    { title: 'ID Campagne', property: 'campaignId' },
    { title: 'Nom de la campagne', property: 'campaignName' },
    { title: 'Nom du Profil Cible', property: 'targetProfileName' },
    { title: 'Nom du Participant', property: 'participantLastName' },
    { title: 'Prénom du Participant', property: 'participantFirstName' },

    ...(idPixLabel ? [ { title: csvService.sanitize(idPixLabel), property: 'participantExternalId' } ] : []),

    { title: '% de progression', property: 'percentageProgression' },
    { title: 'Date de début', property: 'createdAt' },
    { title: 'Partage (O/N)', property: 'isShared' },
    { title: 'Date du partage', property: 'sharedAt' },
    { title: '% maitrise de l\'ensemble des acquis du profil', property: 'percentageSkillValidated' },

    ...(_.flatMap(competences, (competence) => [
      { title: `% de maitrise des acquis de la compétence ${competence.name}`, property: `competence_${competence.id}_percentageValidated` },
      { title: `Nombre d'acquis du profil cible dans la compétence ${competence.name}`, property: `competence_${competence.id}_skillCount` },
      { title: `Acquis maitrisés dans la compétence ${competence.name}`, property: `competence_${competence.id}_validatedSkillCount` },
    ])),

    ...(_.flatMap(areas, (area) => [
      { title: `% de maitrise des acquis du domaine ${area.title}`, property: `area_${area.id}_percentageValidated` },
      { title: `Nombre d'acquis du profil cible du domaine ${area.title}`, property: `area_${area.id}_skillCount` },
      { title: `Acquis maitrisés du domaine ${area.title}`, property: `area_${area.id}_validatedSkillCount` },
    ])),

    ...(_.map(skills, (skill) => ({ title: csvService.sanitize(skill.name), property: `skill_${skill.id}` }))),
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
  const skillsOfCompetences = competence.skills;
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

function _getCommonColumns({
  organization,
  campaign,
  targetProfile,
  participantFirstName,
  participantLastName,
  campaignParticipationResultData,
  knowledgeElements,
}) {
  const percentageProgression = _.round(
    knowledgeElements.length / (targetProfile.skills.length),
    3,
  );

  return {
    organizationName: organization.name,
    campaignId: campaign.id,
    campaignName: campaign.name,
    targetProfileName: targetProfile.name,
    participantLastName,
    participantFirstName,
    percentageProgression,
    createdAt: moment.utc(campaignParticipationResultData.createdAt).format('YYYY-MM-DD'),
    isShared: campaignParticipationResultData.isShared ? 'Oui' : 'Non',
    ...(campaign.idPixLabel ? { participantExternalId: campaignParticipationResultData.participantExternalId } : {}),
  };
}

function _getSharedColumns({
  competences,
  targetProfile,
  areas,
  campaignParticipationResultData,
  knowledgeElements,
}) {
  const competenceStats = _.map(competences, (competence) => {
    const skillsForThisCompetence = _getSkillsOfCompetenceByTargetProfile(competence, targetProfile);
    const skillCount = skillsForThisCompetence.length;
    const validatedSkillCount = _getSkillsValidatedForCompetence(skillsForThisCompetence, knowledgeElements);

    return {
      id: competence.id,
      areaId: competence.area.id,
      skillCount,
      validatedSkillCount,
    };
  });

  const areaStats = _.map(areas, ({ id }) => {
    const areaCompetenceStats = _.filter(competenceStats, { areaId: id });
    const skillCount = _.sumBy(areaCompetenceStats, 'skillCount');
    const validatedSkillCount  = _.sumBy(areaCompetenceStats, 'validatedSkillCount');

    return {
      id,
      skillCount,
      validatedSkillCount,
    };
  });

  const lineMap = {
    sharedAt: moment.utc(campaignParticipationResultData.sharedAt).format('YYYY-MM-DD'),
    percentageSkillValidated: _percentageSkillsValidated(knowledgeElements, targetProfile),
  };

  const addStatsColumns = (prefix) => ({ id, skillCount, validatedSkillCount }) => {
    lineMap[`${prefix}_${id}_percentageValidated`] = _.round(validatedSkillCount / skillCount, 2);
    lineMap[`${prefix}_${id}_skillCount`] = skillCount;
    lineMap[`${prefix}_${id}_validatedSkillCount`] = validatedSkillCount;
  };

  _.forEach(competenceStats, addStatsColumns('competence'));
  _.forEach(areaStats, addStatsColumns('area'));

  _.forEach(targetProfile.skills, ({ id }) => {
    lineMap[`skill_${id}`] = _stateOfSkill(id, knowledgeElements);
  });

  return lineMap;
}

function _createOneLineOfCSV({
  headers,
  organization,
  campaign,
  competences,
  areas,
  campaignParticipationResultData,
  targetProfile,

  participantFirstName,
  participantLastName,
  participantKnowledgeElements,
}) {
  const knowledgeElements = participantKnowledgeElements
    .filter((ke) => _.find(targetProfile.skills, { id: ke.skillId }));

  let lineMap = _getCommonColumns({
    organization,
    campaign,
    targetProfile,
    participantFirstName,
    participantLastName,
    campaignParticipationResultData,
    knowledgeElements,
  });

  if (campaignParticipationResultData.isShared) {
    _.assign(lineMap, _getSharedColumns({
      competences,
      targetProfile,
      areas,
      campaignParticipationResultData,
      knowledgeElements,
    }));
  }

  lineMap = csvService.sanitizeProperties({ objectToSanitize: lineMap, propertiesToSanitize });

  const lineArray = headers.map(({ property }) => {
    return property in lineMap ? lineMap[property] : 'NA';
  });

  return _csvSerializeLine(lineArray);
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
    knowledgeElementRepository,
  }) {

  const campaign = await campaignRepository.get(campaignId);

  await _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);

  const [targetProfile, allCompetences, organization, campaignParticipationResultDatas] = await Promise.all([
    targetProfileRepository.get(campaign.targetProfileId),
    competenceRepository.list(),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findResultDataByCampaignId(campaign.id),
  ]);

  const competences = _extractCompetences(allCompetences, targetProfile.skills);

  const areas = _extractAreas(competences);

  //Create HEADER of CSV
  const headers = _createHeaderOfCSV(targetProfile.skills, competences, areas, campaign.idPixLabel);

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + _csvSerializeLine(_.map(headers, 'title'));

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
      headers,
      organization,
      campaign,
      competences,
      areas,
      campaignParticipationResultData,
      targetProfile,

      participantFirstName: campaignParticipationResultData.participantFirstName,
      participantLastName: campaignParticipationResultData.participantLastName,
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
