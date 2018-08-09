const _ = require('lodash');

const campaignCodeGenerator = require('../services/campaigns/campaign-code-generator');
const campaignValidator = require('../validators/campaign-validator');
const Campaign = require('../models/Campaign');
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

function _createHeaderOfCSV(skills, competences, domains) {
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
    '"Nombre de pix possible"',
    '"% maitrise de l\'ensemble des acquis du profil"',
  ];
  competences.forEach((competence) => {
    headers.push(`"Niveau de la competence ${competence.name}"`);
    headers.push(`"Pix de la competence ${competence.name}"`);
    headers.push(`"% de maitrise des acquis pour la competence ${competence.name}"`);
    headers.push(`"Nombre d'acquis du profil cible maitrisés / nombre d'acquis ${competence.name}"`);
  });

  domains.forEach((domain) => {
    headers.push(`"% de maitrise des acquis pour le domaine ${domain.title}"`);
    headers.push(`"Nombre d'acquis du profil cible maitrisés / nombre d'acquis ${domain.title}"`);
  });

  skills.forEach((skill) => {
    headers.push(`"Acquis ${skill}"`);
  });

  return headers;
}

function _createOneLineOfCSV(headers, organization, campaign, campaignParticipation, userRepository, smartPlacementAssessmentRepository) {
  const line = headers.map((headers) => '');
  line[headers.indexOf('"Nom de l\'organisation"')] = organization.name;
  line[headers.indexOf('"ID Campagne"')] = campaign.id;
  line[headers.indexOf('"Nom de la campagne"')] = campaign.name;
  return smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId)
    .then((assessment) => {
      return Promise.all([assessment, userRepository.get(assessment.userId)])
    })
    .then(([assessment, user]) => {
      line[headers.indexOf('"Nom du Participant"')] = user.firstName;
      line[headers.indexOf('"Prénom du Participant"')] = user.lastName;
      line[headers.indexOf('"Date entrée (rejoint)"')] = assessment.createdAt;
    })
    .then(() => {
      return line.join(';') + '\n';
    });
}

module.exports = function createCampaign({ userId, campaignId,
  campaignRepository, userRepository, targetProfileRepository, competenceRepository,
  campaignParticipationRepository, organizationRepository, smartPlacementAssessmentRepository }) {

  // XXX: add the UTF-8 BOM at the start of the text; see https://stackoverflow.com/a/38192870
  let textCsv = '\uFEFF';
  let campaign, targetProfile, listSkills, headers, listCompetences, listDomains, listCampaignParticipation, organization;

  return campaignRepository.get(campaignId)
    .then((campaignFound) => {
      campaign = campaignFound;
      //return _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository)
    })
    .then(() => {
      const targetProfileId = 1;//campaign.targetProfileId;
      return Promise.all([
        targetProfileRepository.get(targetProfileId),
        competenceRepository.list(),
        organizationRepository.get(campaign.organizationId),
        campaignParticipationRepository.findByCampaignId(campaign.id)
      ]);

    }).then(([targetProfileFound, listAllCompetences, organizationFound, campaignParticipationsFound]) => {
      targetProfile = targetProfileFound;
      listCompetences = listAllCompetences;
      organization = organizationFound;
      listCampaignParticipation = campaignParticipationsFound;

      const listSkillsName = targetProfile.skills.map((skill) => skill.name);
      listCompetences = listCompetences.filter((competence) => {
        return listSkillsName.some((skill)=> competence.skills.includes(skill));
      });
      listDomains = _.uniqBy(listCompetences.map((competence) => competence.area), 'code');

      //Create HEADER of CSV
      headers = _createHeaderOfCSV(listSkillsName, listCompetences, listDomains);
      textCsv += headers.join(';') + '\n';

      // USE SMARTPLACEMENTASSESSMENT
      const getCSVLineForEachParticipation = listCampaignParticipation.map((campaignParticipation) => {
        return _createOneLineOfCSV(headers,organization,campaign, campaignParticipation, userRepository, smartPlacementAssessmentRepository);
      });
      return Promise.all(getCSVLineForEachParticipation);
    })
    .then((csvLineForEachCampagn) => {
      csvLineForEachCampagn.forEach((csvLine) => {
        textCsv += csvLine;
      });
    })
    .then(() => {
      return textCsv;
    });
};
