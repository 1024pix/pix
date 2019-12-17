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

function _createHeaderOfCSV(skillNames, competences, areas, idPixLabel) {
  return [
    'Nom de l\'organisation',
    'ID Campagne',
    'Nom de la campagne',
    'Nom du Profil Cible',
    'Nom du Participant',
    'Prénom du Participant',

    ...(idPixLabel ? [ idPixLabel ] : []),

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

    ...skillNames,
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

function _createOneLineOfCSV(
  headers,
  organization,
  campaign,
  listCompetences,
  listArea,
  campaignParticipation,
  targetProfile,
  userRepository,
  smartPlacementAssessmentRepository,
  knowledgeElementRepository,
) {
  const lineMap = _.fromPairs(headers.map((h) => [h, 'NA']));

  return Promise.all([
    smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId),
    userRepository.get(campaignParticipation.userId),
    knowledgeElementRepository.findUniqByUserId({ userId: campaignParticipation.userId, limitDate: campaignParticipation.sharedAt }),
  ])
    .then(([assessment, user, allKnowledgeElements]) => {

      lineMap['Nom de l\'organisation'] = organization.name;
      lineMap['ID Campagne'] = parseInt(campaign.id);
      lineMap['Nom de la campagne'] = campaign.name;
      lineMap['Nom du Profil Cible'] = targetProfile.name;

      lineMap['Nom du Participant'] = user.lastName;
      lineMap['Prénom du Participant'] = user.firstName;

      if (campaign.idPixLabel) {
        lineMap[campaign.idPixLabel] = campaignParticipation.participantExternalId;
      }

      const knowledgeElements = allKnowledgeElements
        .filter((ke) => targetProfile.skills.find((skill) => skill.id === ke.skillId));

      const notCompletedPercentageProgression = _.round(
        knowledgeElements.length / (targetProfile.skills.length),
        3,
      );
      const percentageProgression = (assessment.isCompleted) ? 1 : notCompletedPercentageProgression;
      lineMap['% de progression'] = percentageProgression;
      lineMap['Date de début'] = moment.utc(assessment.createdAt).format('YYYY-MM-DD');

      const textForParticipationShared = campaignParticipation.isShared ? 'Oui' : 'Non';
      lineMap['Partage (O/N)'] = textForParticipationShared;

      if (campaignParticipation.isShared) {

        lineMap['Date du partage'] = moment.utc(campaignParticipation.sharedAt).format('YYYY-MM-DD');

        lineMap['% maitrise de l\'ensemble des acquis du profil'] = _percentageSkillsValidated(knowledgeElements, targetProfile);

        const areaSkills = listArea.map((area) => {
          return {
            title: area.title,
            numberSkillsValidated: 0,
            numberSkillsTested: 0,
          };
        });

        // By Competences
        _.forEach(listCompetences, (competence) => {
          const skillsForThisCompetence = _getSkillsOfCompetenceByTargetProfile(competence, targetProfile);
          const numberOfSkillsValidatedForThisCompetence = _getSkillsValidatedForCompetence(skillsForThisCompetence,
            knowledgeElements);
          const percentage = _.round(numberOfSkillsValidatedForThisCompetence / skillsForThisCompetence.length, 2);
          lineMap[`% de maitrise des acquis de la compétence ${competence.name}`] = percentage;
          lineMap[`Nombre d'acquis du profil cible dans la compétence ${competence.name}`] = skillsForThisCompetence.length;
          lineMap[`Acquis maitrisés dans la compétence ${competence.name}`] = numberOfSkillsValidatedForThisCompetence;
          // Add on Area
          const areaSkillsForThisCompetence = areaSkills.find((area) => area.title === competence.area.title);
          areaSkillsForThisCompetence.numberSkillsValidated =
            areaSkillsForThisCompetence.numberSkillsValidated + numberOfSkillsValidatedForThisCompetence;
          areaSkillsForThisCompetence.numberSkillsTested =
            areaSkillsForThisCompetence.numberSkillsTested + skillsForThisCompetence.length;
        });

        // By Area
        _.forEach(areaSkills, (area) => {
          const percentage = _.round(area.numberSkillsValidated / area.numberSkillsTested, 2);

          lineMap[`% de maitrise des acquis du domaine ${area.title}`] = percentage;
          lineMap[`Nombre d'acquis du profil cible du domaine ${area.title}`] = area.numberSkillsTested;
          lineMap[`Acquis maitrisés du domaine ${area.title}`] = area.numberSkillsValidated;

        });

        // By Skills
        _.forEach(targetProfile.skills, (skill) => {
          lineMap[skill.name] = _stateOfSkill(skill.id, knowledgeElements);
        });
      }
      return lineMap;
    })
    .then((lineMap) => {
      const lineArray = headers.map((title) => {
        return lineMap[title];
      });

      return _csvSerializeLine(lineArray);
    });
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

  const [targetProfile, listAllCompetences, organization, listCampaignParticipation] = await Promise.all([
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

  //Create HEADER of CSV
  const headersAsArray = _createHeaderOfCSV(listSkillsName, listCompetences, listArea, campaign.idPixLabel);

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + _csvSerializeLine(headersAsArray);

  writableStream.write(headerLine);

  bluebird.mapSeries(listCampaignParticipation, async (campaignParticipation) => {
    const csvLine = await _createOneLineOfCSV(
      headersAsArray,
      organization,
      campaign,
      listCompetences,
      listArea,
      campaignParticipation,
      targetProfile,
      userRepository,
      smartPlacementAssessmentRepository,
      knowledgeElementRepository
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
