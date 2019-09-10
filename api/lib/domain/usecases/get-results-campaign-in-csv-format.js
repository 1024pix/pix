const _ = require('lodash');
const moment = require('moment');

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

function _cleanText(text) {
  return `"${text.replace(/"/g, '""')}"`;
}

function _createHeaderOfCSV(skillNames, competences, areas, idPixLabel) {
  const headers = [];
  headers.push('"Nom de l\'organisation"');
  headers.push('"ID Campagne"');
  headers.push('"Nom de la campagne"');
  headers.push('"Nom du Profil Cible"');
  headers.push('"Nom du Participant"');
  headers.push('"Prénom du Participant"');
  if (idPixLabel) {
    headers.push(_cleanText(idPixLabel));
  }
  headers.push('"% de progression"');
  headers.push('"Date de début"');
  headers.push('"Partage (O/N)"');
  headers.push('"Date du partage"');
  headers.push('"% maitrise de l\'ensemble des acquis du profil"');

  competences.forEach((competence) => {
    headers.push(`"% de maitrise des acquis de la compétence ${competence.name}"`);
    headers.push(`"Nombre d'acquis du profil cible dans la compétence ${competence.name}"`);
    headers.push(`"Acquis maitrisés dans la compétence ${competence.name}"`);
  });

  areas.forEach((area) => {
    headers.push(`"% de maitrise des acquis du domaine ${area.title}"`);
    headers.push(`"Nombre d'acquis du profil cible du domaine ${area.title}"`);
    headers.push(`"Acquis maitrisés du domaine ${area.title}"`);
  });

  skillNames.forEach((skillName) => {
    headers.push(`"${skillName}"`);
  });

  return headers;
}

function _addCellByHeadersTitleForNumber(title, data, line, headers) {
  line[headers.indexOf(title)] = data.toString().replace('.', ',');
  return line;
}

function _addCellByHeadersTitleForText(title, data, line, headers) {
  line[headers.indexOf(title)] = `"${data.toString().replace(/"/g, '""')}"`;
  return line;
}

/*function _totalPixScore(knowledgeElements) {
 const sumTotalPixScore = _.reduce(knowledgeElements, function(sumPix, knowledgeElement) {
 if (knowledgeElement.isValidated) {
 return sumPix + knowledgeElement.pixScore;
 }
 return sumPix;
 }, 0);
 return sumTotalPixScore;
 }*/

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
  let line = headers.map(() => '"NA"');

  return smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId)
    .then((assessment) => {
      return Promise.all([
        assessment,
        userRepository.get(assessment.userId),
        knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId, limitDate: assessment.campaignParticipation.sharedAt })
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

module.exports = function getResultsCampaignInCSVFormat(
  {
    userId,
    campaignId,
    campaignRepository,
    userRepository,
    targetProfileRepository,
    competenceRepository,
    campaignParticipationRepository,
    organizationRepository,
    smartPlacementAssessmentRepository,
    knowledgeElementRepository,
  }) {

  let campaign, headersAsArray, listCompetences, listArea, organization;
  // XXX: add the UTF-8 BOM at the start of the text; see https://stackoverflow.com/a/38192870
  let textCsv = '\uFEFF';

  return campaignRepository.get(campaignId)
    .then((campaignFound) => {
      campaign = campaignFound;
      return _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);
    })
    .then(() => {
      return Promise.all([
        targetProfileRepository.get(campaign.targetProfileId),
        competenceRepository.list(),
        organizationRepository.get(campaign.organizationId),
        campaignParticipationRepository.findByCampaignId(campaign.id),
      ]);

    }).then(([targetProfile, listAllCompetences, organizationFound, listCampaignParticipation]) => {
      organization = organizationFound;

      const listSkillsName = targetProfile.skills.map((skill) => skill.name);
      const listSkillsId = targetProfile.skills.map((skill) => skill.id);

      listCompetences = listAllCompetences.filter((competence) => {
        return listSkillsId.some((skillId) => competence.skills.includes(skillId));
      });

      listArea = _.uniqBy(listCompetences.map((competence) => competence.area), 'code');

      //Create HEADER of CSV
      headersAsArray = _createHeaderOfCSV(listSkillsName, listCompetences, listArea, campaign.idPixLabel);
      textCsv += headersAsArray.join(';') + '\n';

      const getCSVLineForEachParticipation = listCampaignParticipation.map((campaignParticipation) => {
        return _createOneLineOfCSV(
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
      });
      return Promise.all(getCSVLineForEachParticipation);
    })
    .then((csvLineForEachPartication) => {
      csvLineForEachPartication.forEach((csvLine) => {
        textCsv += csvLine;
      });
      return { csvData: textCsv, campaignName: campaign.name };
    });
};
