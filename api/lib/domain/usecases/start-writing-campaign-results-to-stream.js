const _ = require('lodash');
const moment = require('moment');
const bluebird = require('bluebird');

const { UserNotAuthorizedToGetCampaignResultsError, CampaignWithoutOrganizationError } = require('../errors');

function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  if (_.isNil(organizationId)) {
    return Promise.reject(new CampaignWithoutOrganizationError(`Campaign without organization : ${organizationId}`));
  }

  return userRepository.getWithMemberships(userId)
    .then((user) => {
      if (user.hasAccessToOrganization(organizationId)) {
        return Promise.resolve();
      }
      return Promise.reject(
        new UserNotAuthorizedToGetCampaignResultsError(`User does not have an access to the organization ${organizationId}`),
      );
    });
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

    ...(idPixLabel ? [ { title: idPixLabel, property: 'participantExternalId' } ] : []),

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

    ...(_.map(skills, (skill) => ({ title: `${skill.name}`, property: `skill_${skill.id}` }))),
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

function _fetchUserData(
  campaignParticipation,

  userRepository,
  smartPlacementAssessmentRepository,
  knowledgeElementRepository,
) {
  return bluebird.props({
    assessment: smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId),
    user: userRepository.get(campaignParticipation.userId),
    userKnowledgeElements: knowledgeElementRepository.findUniqByUserId({ userId: campaignParticipation.userId, limitDate: campaignParticipation.sharedAt }),
  });
}

function _createOneLineOfCSV({
  headers,
  organization,
  campaign,
  competences,
  areas,
  campaignParticipation,
  targetProfile,

  assessment,
  user,
  userKnowledgeElements,
}) {
  const lineMap = _.fromPairs(headers.map((h) => [ h.property, 'NA' ]));

  lineMap.organizationName = organization.name;
  lineMap.campaignId = parseInt(campaign.id);
  lineMap.campaignName = campaign.name;
  lineMap.targetProfileName = targetProfile.name;

  lineMap.participantLastName = user.lastName;
  lineMap.participantFirstName = user.firstName;

  if (campaign.idPixLabel) {
    lineMap.participantExternalId = campaignParticipation.participantExternalId;
  }

  const knowledgeElements = userKnowledgeElements
    .filter((ke) => _.find(targetProfile.skills, { id: ke.skillId }));

  const notCompletedPercentageProgression = _.round(
    knowledgeElements.length / (targetProfile.skills.length),
    3,
  );
  const percentageProgression = (assessment.isCompleted) ? 1 : notCompletedPercentageProgression;
  lineMap.percentageProgression = percentageProgression;
  lineMap.createdAt = moment.utc(assessment.createdAt).format('YYYY-MM-DD');

  const textForParticipationShared = campaignParticipation.isShared ? 'Oui' : 'Non';
  lineMap.isShared = textForParticipationShared;

  if (campaignParticipation.isShared) {

    lineMap.sharedAt = moment.utc(campaignParticipation.sharedAt).format('YYYY-MM-DD');

    lineMap.percentageSkillValidated = _percentageSkillsValidated(knowledgeElements, targetProfile);

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
  }

  const lineArray = headers.map(({ property }) => {
    return lineMap[property];
  });

  return _csvSerializeLine(lineArray);
}

function _extractCompetences(allCompetences, skills) {
  return _(skills)
    .map('competenceId')
    .uniq()
    .map((competenceId) => _.find(allCompetences, { id: competenceId }))
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
    smartPlacementAssessmentRepository,
    knowledgeElementRepository,
  }) {

  const campaign = await campaignRepository.get(campaignId);

  await _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);

  const [targetProfile, allCompetences, organization, listCampaignParticipation] = await Promise.all([
    targetProfileRepository.get(campaign.targetProfileId),
    competenceRepository.list(),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findByCampaignId(campaign.id),
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

  bluebird.mapSeries(listCampaignParticipation, async (campaignParticipation) => {
    const { assessment, user, userKnowledgeElements } = await _fetchUserData(
      campaignParticipation,

      userRepository,
      smartPlacementAssessmentRepository,
      knowledgeElementRepository
    );

    const csvLine = _createOneLineOfCSV({
      headers,
      organization,
      campaign,
      competences,
      areas,
      campaignParticipation,
      targetProfile,

      assessment,
      user,
      userKnowledgeElements,
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
