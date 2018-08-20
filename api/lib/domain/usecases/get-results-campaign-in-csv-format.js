const _ = require('lodash');

const { UserNotAuthorizedToCreateCampaignError } = require('../errors');

function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  if(_.isNil(organizationId)) {
    return Promise.resolve();
  }

  return userRepository.getWithOrganizationAccesses(userId)
    .then((user) => {
      if(user.hasAccessToOrganization(organizationId)) {
        return Promise.resolve();
      }
      return Promise.reject(new UserNotAuthorizedToCreateCampaignError(`User does not have an access to the organization ${organizationId}`));
    });
}

function _createHeaderOfCSV(skills, competences, areas) {
  const headers = [
    '"Nom de l\'organisation"',
    '"ID Campagne"',
    '"Nom de la campagne"',
    '"Nom du Profil Cible"',
    '"Nom du Participant"',
    '"Prénom du Participant"',
    '"ID PIX"',
    '"Nom invité"',
    '"Prénom invité"',
    '"Email invité"',
    '"Champs optionel 1"',
    '"Champs optionel 2"',
    '"Champs optionel 3"',
    '"ID invitation"',
    '"Statut (invité / participant / terminé)"',
    '"% de progression"',
    '"Date entrée (rejoint)"',
    '"Partage (O/N)"',
    '"Date du partage"',
    '"Heure du partage"',
    '"Nombre de Pix obtenus"',
    '"Nombre de pix possibles"',
    '"% maitrise de l\'ensemble des acquis du profil"',
  ];
  competences.forEach((competence) => {
    headers.push(`"Niveau de la competence ${competence.name}"`);
    headers.push(`"Pix de la competence ${competence.name}"`);
    headers.push(`"% de maitrise des acquis pour la competence ${competence.name}"`);
    headers.push(`"Nombre d'acquis du profil cible maitrisés / nombre d'acquis ${competence.name}"`);
  });

  areas.forEach((area) => {
    headers.push(`"% de maitrise des acquis pour le domaine ${area.title}"`);
    headers.push(`"Nombre d'acquis du profil cible maitrisés / nombre d'acquis ${area.title}"`);
  });

  skills.forEach((skill) => {
    headers.push(`"Acquis ${skill}"`);
  });

  return headers;
}

function _addCellByHeadersTitle(title, data, line, headers) {
  line[headers.indexOf(title)] = `"${data}"`;
  return line;
}

function _totalPixScore(knowledgeElements) {
  const sumTotalPixScore = _.reduce(knowledgeElements, function(sumPix, knowledgeElement) {
    if(knowledgeElement.isValidated) {
      return sumPix + knowledgeElement.pixScore;
    }
    return sumPix;
  }, 0);
  return sumTotalPixScore;
}

function _totalValidatedSkills(knowledgeElements) {
  const sumValidatedSkills = _.reduce(knowledgeElements, function(validatedSkill, knowledgeElement) {
    if(knowledgeElement.isValidated) {
      return validatedSkill + 1;
    }
    return validatedSkill;
  }, 0);
  return sumValidatedSkills;
}

function _numberSkillsValidatedInProfile(assessment, targetProfile) {
  return _totalValidatedSkills(assessment.knowledgeElements) * 100 / targetProfile.skills.length;
}

function _stateOfSkill(skillName, knowledgeElements) {
  // XXX : Currently, skillId is skillName
  const knowledgeElementForSkill = _.findLast(knowledgeElements, (knowledgeElement) => knowledgeElement.skillId == skillName);
  if(knowledgeElementForSkill) {
    return knowledgeElementForSkill.isValidated ? 'OK' : 'KO';
  } else {
    return 'Non testé';
  }
}

function _getSkillsOfCompetenceByTargetProfile(competence, targetProfile) {
  const skillsOfProfile = targetProfile.skills;
  const skillsOfCompetences = competence.skills;
  return skillsOfProfile
    .filter((skillOfProfile) => skillsOfCompetences.some((skill)=> skill === skillOfProfile.id));
}

function _getSkillsValidatedForCompetence(skills, knowledgeElements) {
  const sumValidatedSkills = _.reduce(knowledgeElements, function(validatedSkill, knowledgeElement) {
    if(knowledgeElement.isValidated && skills.find(skill => skill.name === knowledgeElement.skillId)) {
      return validatedSkill + 1;
    }
    return validatedSkill;
  }, 0);
  return sumValidatedSkills;

}

function _createOneLineOfCSV(headers, organization, campaign, listCompetences, listArea, campaignParticipation, targetProfile, userRepository, smartPlacementAssessmentRepository) {
  let line = headers.map(() => '');

  return smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId)
    .then((assessment) => {
      return Promise.all([assessment, userRepository.get(assessment.userId)]);
    })
    .then(([assessment, user]) => {
      '"Partage (O/N)"',
        '"Date du partage"',
        '"Heure du partage"',
        '"Nombre de Pix obtenus"',
        '"Nombre de pix possible"',
        '"% maitrise de l\'ensemble des acquis du profil"',

        line = _addCellByHeadersTitle('"Nom de l\'organisation"', organization.name, line, headers);
      line = _addCellByHeadersTitle('"ID Campagne"', campaign.id, line, headers);
      line = _addCellByHeadersTitle('"Nom de la campagne"', campaign.name, line, headers);
      line = _addCellByHeadersTitle('"Nom du Profil Cible"', targetProfile.name, line, headers);

      line = _addCellByHeadersTitle('"Nom du Participant"', user.firstName, line, headers);
      line = _addCellByHeadersTitle('"Prénom du Participant"', user.lastName, line, headers);

      line = _addCellByHeadersTitle('"ID PIX"', '', line, headers);
      line = _addCellByHeadersTitle('"Nom invité"', '', line, headers);
      line = _addCellByHeadersTitle('"Prénom invité"', '', line, headers);
      line = _addCellByHeadersTitle('"Email invité"', '', line, headers);

      line = _addCellByHeadersTitle('"Champs optionel 1"','', line, headers);
      line = _addCellByHeadersTitle('"Champs optionel 2"','', line, headers);
      line = _addCellByHeadersTitle('"Champs optionel 3"','', line, headers);
      line = _addCellByHeadersTitle('"ID invitation"','', line, headers);
      line = _addCellByHeadersTitle('"Statut (invité / participant / terminé)"','', line, headers);

      // Question : set % of progression at 100 when its finished ?
      line = _addCellByHeadersTitle('"% de progression"', assessment.knowledgeElements.length * 100 / (targetProfile.skills.length), line, headers);
      line = _addCellByHeadersTitle('"Date entrée (rejoint)"', assessment.createdAt, line, headers);

      line = _addCellByHeadersTitle('"Partage (O/N)"','', line, headers);
      line = _addCellByHeadersTitle('"Date du partage"','', line, headers);
      line = _addCellByHeadersTitle('"Heure du partage"','', line, headers);

      if(assessment.isCompleted) {
        line = _addCellByHeadersTitle('"Nombre de Pix obtenus"', _totalPixScore(assessment.knowledgeElements), line, headers);
        line = _addCellByHeadersTitle('"Nombre de pix possibles"', '0', line, headers);
        line = _addCellByHeadersTitle('"% maitrise de l\'ensemble des acquis du profil"', _numberSkillsValidatedInProfile(assessment, targetProfile), line, headers);

        // By Competences

        _.forEach(listCompetences, (competence) => {
          const skillsForThisCompetence = _getSkillsOfCompetenceByTargetProfile(competence, targetProfile);
          const skillsValidatedForThisCompetence = _getSkillsValidatedForCompetence(skillsForThisCompetence, assessment.knowledgeElements);
          const percentage = skillsValidatedForThisCompetence * 100 / skillsForThisCompetence.length;
          const diff = `${skillsValidatedForThisCompetence}/${skillsForThisCompetence.length}`;
          line = _addCellByHeadersTitle(`"% de maitrise des acquis pour la competence ${competence.name}"`, percentage, line, headers);
          line = _addCellByHeadersTitle(`"Nombre d'acquis du profil cible maitrisés / nombre d'acquis ${competence.name}"`, diff, line, headers);
        });
        // By Area

        // By Skills
        _.forEach(targetProfile.skills, (skill) => {
          line = _addCellByHeadersTitle(`"Acquis ${skill.name}"`, _stateOfSkill(skill.name, assessment.knowledgeElements), line, headers);
        });
      }
    })
    .then(() => {
      return line.join(';') + '\n';
    });
}

module.exports = function createCampaign(
  {
    userId,
    campaignId,
    campaignRepository,
    userRepository,
    targetProfileRepository,
    competenceRepository,
    campaignParticipationRepository,
    organizationRepository,
    smartPlacementAssessmentRepository
  }) {

  // XXX: add the UTF-8 BOM at the start of the text; see https://stackoverflow.com/a/38192870
  let campaign, targetProfile, headersAsArray, listCompetences, listArea, listCampaignParticipation, organization;
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
        campaignParticipationRepository.findByCampaignId(campaign.id)
      ]);

    }).then(([targetProfileFound, listAllCompetences, organizationFound, campaignParticipationsFound]) => {
      targetProfile = targetProfileFound;
      organization = organizationFound;
      listCampaignParticipation = campaignParticipationsFound;

      const listSkillsName = targetProfile.skills.map((skill) => skill.name);
      const listSkillsId = targetProfile.skills.map((skill) => skill.id);

      listCompetences = listAllCompetences.filter((competence) => {
        return listSkillsId.some((skill)=> competence.skills.includes(skill));
      });
      listArea = _.uniqBy(listCompetences.map((competence) => competence.area), 'code');

      //Create HEADER of CSV
      headersAsArray = _createHeaderOfCSV(listSkillsName, listCompetences, listArea);
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
    })
    .then(() => {
      return textCsv;
    });
};
