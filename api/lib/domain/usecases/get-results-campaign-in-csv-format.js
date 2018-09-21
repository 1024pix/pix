const _ = require('lodash');
const moment = require('moment');

const { UserNotAuthorizedToGetCampaignResultsError, CampaignWithoutOrganizationError } = require('../errors');

function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  if (_.isNil(organizationId)) {
    return Promise.reject(new CampaignWithoutOrganizationError(`Campaign without organization : ${organizationId}`));
  }

  return userRepository.getWithOrganizationAccesses(userId)
    .then((user) => {
      if (user.hasAccessToOrganization(organizationId)) {
        return Promise.resolve();
      }
      return Promise.reject(
        new UserNotAuthorizedToGetCampaignResultsError(`User does not have an access to the organization ${organizationId}`),
      );
    });
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
    headers.push(`"${idPixLabel.replace(/"/g, '""')}"`);
  }
  headers.push('"Nom invité"');
  headers.push('"Prénom invité"');
  headers.push('"Email invité"');
  headers.push('"Champs optionel 1"');
  headers.push('"Champs optionel 2"');
  headers.push('"Champs optionel 3"');
  headers.push('"ID invitation"');
  headers.push('"% de progression"');
  headers.push('"Date de début"');
  headers.push('"Partage (O/N)"');
  headers.push('"Date du partage"');
  headers.push('"Nombre de Pix obtenus"');
  headers.push('"Nombre de pix possibles"');
  headers.push('"% maitrise de l\'ensemble des acquis du profil"');

  competences.forEach((competence) => {
    headers.push(`"Niveau de la competence ${competence.name}"`);
    headers.push(`"Pix de la competence ${competence.name}"`);
    headers.push(`"% de maitrise des acquis de la compétence ${competence.name}"`);
    headers.push(`"Nombre d'acquis du profil cible maitrisés / nombre d'acquis de la compétence ${competence.name}"`);
  });

  areas.forEach((area) => {
    headers.push(`"% de maitrise des acquis du domaine ${area.title}"`);
    headers.push(`"Nombre d'acquis du profil cible maitrisés / nombre d'acquis du domaine ${area.title}"`);
  });

  skillNames.forEach((skillName) => {
    headers.push(`"Acquis ${skillName}"`);
  });

  return headers;
}

function _addCellByHeadersTitleForNumber(title, data, line, headers) {
  line[headers.indexOf(title)] = data;
  return line;
}

function _addCellByHeadersTitleForText(title, data, line, headers) {
  line[headers.indexOf(title)] = `="${data.toString().replace(/"/g, '""')}"`;
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

function _percentageSkillsValidated(assessment, targetProfile) {
  return _.round(_totalValidatedSkills(assessment.knowledgeElements) * 100 / targetProfile.skills.length, 1);
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
) {
  let line = headers.map(() => '"NA"');

  return smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId)
    .then((assessment) => {
      return Promise.all([assessment, userRepository.get(assessment.userId)]);
    })
    .then(([assessment, user]) => {
      line = _addCellByHeadersTitleForText('"Nom de l\'organisation"', organization.name, line, headers);
      line = _addCellByHeadersTitleForText('"ID Campagne"', campaign.id, line, headers);
      line = _addCellByHeadersTitleForText('"Nom de la campagne"', campaign.name, line, headers);
      line = _addCellByHeadersTitleForText('"Nom du Profil Cible"', targetProfile.name, line, headers);

      line = _addCellByHeadersTitleForText('"Nom du Participant"', user.firstName, line, headers);
      line = _addCellByHeadersTitleForText('"Prénom du Participant"', user.lastName, line, headers);

      const notCompletedPercentageProgression = _.round(
        assessment.knowledgeElements.length * 100 / (targetProfile.skills.length),
        1,
      );
      const percentageProgression = (assessment.isCompleted) ? 100 : notCompletedPercentageProgression;
      line = _addCellByHeadersTitleForNumber('"% de progression"', percentageProgression, line, headers);
      line = _addCellByHeadersTitleForText(
        '"Date de début"',
        moment(assessment.createdAt).format('YYYY-MM-DD'),
        line,
        headers,
      );

      line = _addCellByHeadersTitleForText('"Partage (O/N)"', campaignParticipation.isShared, line, headers);

      if(assessment.isCompleted && campaignParticipation.isShared) {

        line = _addCellByHeadersTitleForText('"Date du partage"', moment(campaignParticipation.sharedAt).format('YYYY-MM-DD'), line, headers);

        line = _addCellByHeadersTitleForNumber(
          '"% maitrise de l\'ensemble des acquis du profil"',
          _percentageSkillsValidated(assessment, targetProfile),
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
            assessment.knowledgeElements);
          const percentage = _.round(numberOfSkillsValidatedForThisCompetence * 100 / skillsForThisCompetence.length,
            1);
          const diff = `${numberOfSkillsValidatedForThisCompetence}/${skillsForThisCompetence.length}`;
          line = _addCellByHeadersTitleForNumber(
            `"% de maitrise des acquis de la compétence ${competence.name}"`,
            percentage,
            line,
            headers,
          );
          line = _addCellByHeadersTitleForText(
            `"Nombre d'acquis du profil cible maitrisés / nombre d'acquis de la compétence ${competence.name}"`,
            diff,
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
          const percentage = _.round(area.numberSkillsValidated * 100 / area.numberSkillsTested, 1);
          const diff = `${area.numberSkillsValidated}/${area.numberSkillsTested}`;

          line = _addCellByHeadersTitleForNumber(`"% de maitrise des acquis du domaine ${area.title}"`,
            percentage,
            line,
            headers);
          line = _addCellByHeadersTitleForText(
            `"Nombre d'acquis du profil cible maitrisés / nombre d'acquis du domaine ${area.title}"`,
            diff,
            line,
            headers,
          );
        });

        // By Skills
        _.forEach(targetProfile.skills, (skill) => {
          line = _addCellByHeadersTitleForText(`"Acquis ${skill.name}"`,
            _stateOfSkill(skill.id, assessment.knowledgeElements),
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
