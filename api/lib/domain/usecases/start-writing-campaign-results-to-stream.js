const _ = require('lodash');
const moment = require('moment');
const bluebird = require('bluebird');

const { UserNotAuthorizedToGetCampaignResultsError, CampaignWithoutOrganizationError } = require('../errors');

async function _ensureCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  if (_.isNil(organizationId)) {
    throw new CampaignWithoutOrganizationError(`Campaign without organization : ${organizationId}`);
  }
  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(`User does not have an access to the organization ${organizationId}`);
  }
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

function _addCellByHeadersTitleForNumber(title, data, line, headers) {
  line[headers.indexOf(title)] = data.toString().replace('.', ',');
  return line;
}

function _addCellByHeadersTitleForText(title, data, line, headers) {
  line[headers.indexOf(title)] = `"${data.toString().replace(/"/g, '""')}"`;
  return line;
}

function _percentageSkillsValidated(knowledgeElements, targetProfile) {
  const totalValidatedSkills = _.sumBy(knowledgeElements, 'isValidated');
  return _.round(totalValidatedSkills / targetProfile.skills.length, 2);
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
  let line = headers.map(() => '"NA"');

  return smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId)
    .then((assessment) => {
      return Promise.all([
        assessment,
        userRepository.get(assessment.userId),
        knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId, limitDate: campaignParticipation.sharedAt })
      ]);
    })
    .then(([assessment, user, allKnowledgeElements]) => {

      line = _addCellByHeadersTitleForText('"Nom de l\'organisation"', organization.name, line, headers);
      line = _addCellByHeadersTitleForNumber('"ID Campagne"', campaign.id, line, headers);
      line = _addCellByHeadersTitleForText('"Nom de la campagne"', campaign.name, line, headers);
      line = _addCellByHeadersTitleForText('"Nom du Profil Cible"', targetProfile.name, line, headers);

      line = _addCellByHeadersTitleForText('"Nom du Participant"', user.lastName, line, headers);
      line = _addCellByHeadersTitleForText('"Prénom du Participant"', user.firstName, line, headers);

      if (campaign.idPixLabel) {
        line = _addCellByHeadersTitleForText(_cleanText(campaign.idPixLabel), campaignParticipation.participantExternalId, line, headers);
      }

      const knowledgeElements = allKnowledgeElements
        .filter((ke) => targetProfile.skills.find((skill) => skill.id === ke.skillId));

      const notCompletedPercentageProgression = _.round(
        knowledgeElements.length / (targetProfile.skills.length),
        3,
      );
      const percentageProgression = (assessment.isCompleted) ? 1 : notCompletedPercentageProgression;
      line = _addCellByHeadersTitleForNumber('"% de progression"', percentageProgression, line, headers);
      line = _addCellByHeadersTitleForNumber(
        '"Date de début"',
        moment.utc(assessment.createdAt).format('YYYY-MM-DD'),
        line,
        headers,
      );

      const textForParticipationShared = campaignParticipation.isShared ? 'Oui' : 'Non';
      line = _addCellByHeadersTitleForText('"Partage (O/N)"', textForParticipationShared, line, headers);

      if (assessment.isCompleted && campaignParticipation.isShared) {

        line = _addCellByHeadersTitleForNumber('"Date du partage"', moment.utc(campaignParticipation.sharedAt).format('YYYY-MM-DD'), line, headers);

        line = _addCellByHeadersTitleForNumber(
          '"% maitrise de l\'ensemble des acquis du profil"',
          _percentageSkillsValidated(knowledgeElements, targetProfile),
          line,
          headers,
        );

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
          line = _addCellByHeadersTitleForNumber(
            `"% de maitrise des acquis de la compétence ${competence.name}"`,
            percentage,
            line,
            headers,
          );
          line = _addCellByHeadersTitleForNumber(
            `"Nombre d'acquis du profil cible dans la compétence ${competence.name}"`,
            skillsForThisCompetence.length,
            line,
            headers,
          );
          line = _addCellByHeadersTitleForNumber(
            `"Acquis maitrisés dans la compétence ${competence.name}"`,
            numberOfSkillsValidatedForThisCompetence,
            line,
            headers,
          );
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

          line = _addCellByHeadersTitleForNumber(`"% de maitrise des acquis du domaine ${area.title}"`,
            percentage,
            line,
            headers);
          line = _addCellByHeadersTitleForNumber(
            `"Nombre d'acquis du profil cible du domaine ${area.title}"`,
            area.numberSkillsTested,
            line,
            headers,
          );
          line = _addCellByHeadersTitleForNumber(
            `"Acquis maitrisés du domaine ${area.title}"`,
            area.numberSkillsValidated,
            line,
            headers,
          );

        });

        // By Skills
        _.forEach(targetProfile.skills, (skill) => {
          line = _addCellByHeadersTitleForText(`"${skill.name}"`,
            _stateOfSkill(skill.id, knowledgeElements),
            line,
            headers);
        });
      }
    })
    .then(() => {
      return line.join(';') + '\n';
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

  await _ensureCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);

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

  const headersAsArray = createCsvHeader(listSkillsName, listCompetences, listArea, campaign.idPixLabel);

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + headersAsArray.join(';') + '\n';

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
