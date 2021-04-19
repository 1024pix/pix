const PIX_EMPLOI_CLEA_BADGE_ID = 100;
const BASICS_BADGE_ID = 111;
const TOOLS_BADGE_ID = 112;
const MANIP_BADGE_ID = 113;
const PRO_BASICS_BADGE_ID = 114;
const PRO_TOOLS_BADGE_ID = 115;
const PIX_DROIT_MAITRE_BADGE_ID = 116;
const PIX_DROIT_EXPERT_BADGE_ID = 117;

const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');
const Badge = require('../../../lib/domain/models/Badge');
const {
  skillIdsForBadgePartnerCompetences,
  TARGET_PROFILE_STAGES_BADGES_ID,
  TARGET_PROFILE_ONE_COMPETENCE_ID,
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
  TARGET_PROFILE_PIX_DROIT_ID,
} = require('./target-profiles-builder');

function badgesBuilder({ databaseBuilder }) {
  _createPixEmploiCleaBadge(databaseBuilder);
  _createBasicsBadge(databaseBuilder);
  _createToolsBadge(databaseBuilder);
  _createManipBadge(databaseBuilder);
  _createProfessionalBasicsBadge(databaseBuilder);
  _createProfessionalToolsBadge(databaseBuilder);
  _createPixDroitBadge(databaseBuilder);
}

function _createPixEmploiCleaBadge(databaseBuilder) {
  const badge = databaseBuilder.factory.buildBadge({
    id: PIX_EMPLOI_CLEA_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix Emploi.',
    title: 'Pix Emploi - Clea',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/Pix-emploi.svg',
    key: Badge.keys.PIX_EMPLOI_CLEA,
    message: 'Bravo ! Vous maîtrisez les compétences indispensables pour utiliser le numérique en milieu professionnel. ' +
      'Pour valoriser vos compétences avec une double certification Pix-CléA numérique, renseignez-vous auprès de votre conseiller ou de votre formateur.',
    targetProfileId: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
  });

  const badgePartnerCompetencesIds = _associateBadgePartnerCompetences(databaseBuilder, skillIdsForBadgePartnerCompetences, badge);
  _associateBadgeCriteria(databaseBuilder, badge, badgePartnerCompetencesIds);
}

function _createBasicsBadge(databaseBuilder) {
  const targetProfileSkillIdsForBasicsBadge = [
    ['rectL2ZZeWPc7yezp', 'recndXqXiv4pv2Ukp'],
    ['recMOy4S8XnaWblYI', 'recagUd44RPEWti0X'],
    ['recrvTvLTUXEcUIV1', 'recX7RyCsdNV2p168'],
    ['recxtb5aLs6OAAKIg', 'receRbbt9Lb661wFB'],
  ];

  const basicsBadge = databaseBuilder.factory.buildBadge({
    id: BASICS_BADGE_ID,
    altMessage: 'Vous avez validé les bases.',
    title: 'Des bases sont là',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/socle-de-base.svg',
    key: 'Basics',
    message: 'Bravo ! Vous maîtrisez quelques bases du numérique comme le vocabulaire, la manipulation basique ou l\'utilisation d\'outils',
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
  });

  const badgePartnerCompetencesIds = _associateBadgePartnerCompetences(databaseBuilder, targetProfileSkillIdsForBasicsBadge, basicsBadge);
  _associateBadgeCriteria(databaseBuilder, basicsBadge, badgePartnerCompetencesIds);
}

function _createToolsBadge(databaseBuilder) {
  const targetProfileSkillIdsForToolsBadge = [
    ['rec71e3PSct2zLEMj', 'recFwJlpllhWzuLom'],
    ['rec0J9OXaAj5v7w3r', 'reclY3njuk6EySJuU'],
    ['rec5V9gp65a58nnco', 'recPrXhP0X07OdHXe'],
    ['recPG9ftlGZLiF0O6', 'rectLj7NPg5JcSIqN'],
  ];

  const toolsBadge = databaseBuilder.factory.buildBadge({
    id: TOOLS_BADGE_ID,
    altMessage: 'Vous avez validé le Vocabulaire et outils du numérique.',
    title: 'Vocabulaire et outils du numérique',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/pro-recherche.svg',
    key: 'Tools',
    message: 'Vous reconnaissez les éléments courants du numérique: le matériel, la messagerie, un document et un navigateur WEB.',
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
  });

  const badgePartnerCompetencesIds = _associateBadgePartnerCompetences(databaseBuilder, targetProfileSkillIdsForToolsBadge, toolsBadge);
  _associateBadgeCriteria(databaseBuilder, toolsBadge, badgePartnerCompetencesIds);
}

function _createManipBadge(databaseBuilder) {
  const targetProfileSkillIdsForManipBadge = [
    ['rec9qal2FLjWysrfu', 'rechRPFlSryfY3UnG'],
    ['recL0AotZshb9quhR', 'recrOwaV2PTt1N0i5'],
    ['recpdpemRXuzV9r10', 'recWXtN5cNP1JQUVx'],
    ['recTIddrkopID28Ep', 'recBrDIfDDW2IPpZV'],
  ];

  const manipBadge = databaseBuilder.factory.buildBadge({
    id: MANIP_BADGE_ID,
    altMessage: 'Vous avez validé la manipulation.',
    title: 'Je manipule',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/office.svg',
    key: 'Manip',
    message: 'Vous maîtrisez les gestes de base : le clic, la saisie de texte et la navigation entre onglets d\'un navigateur WEB',
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
  });

  const badgePartnerCompetencesIds = _associateBadgePartnerCompetences(databaseBuilder, targetProfileSkillIdsForManipBadge, manipBadge);
  _associateBadgeCriteria(databaseBuilder, manipBadge, badgePartnerCompetencesIds);
}

function _createProfessionalBasicsBadge(databaseBuilder) {
  const basicsBadge = databaseBuilder.factory.buildBadge({
    id: PRO_BASICS_BADGE_ID,
    altMessage: 'Vous avez validé les bases professionnelles.',
    title: 'Bases professionnelles',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/socle-de-base.svg',
    key: 'Pro Basics',
    message: 'Bravo ! Vous maîtrisez quelques bases  du numérique pour le monde professionnel !',
    targetProfileId: TARGET_PROFILE_ONE_COMPETENCE_ID,
  });

  _associateBadgeCriteria(databaseBuilder, basicsBadge);
}

function _createProfessionalToolsBadge(databaseBuilder) {
  const toolsBadge = databaseBuilder.factory.buildBadge({
    id: PRO_TOOLS_BADGE_ID,
    altMessage: 'Vous avez validé le Vocabulaire et outils professionels du numérique.',
    title: 'Vocabulaire et outils professionels du numérique',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/pro-recherche.svg',
    key: 'Pro Tools',
    message: 'Vous reconnaissez les éléments courants professionels du numérique: le matériel, la messagerie, un document et un navigateur WEB.',
    targetProfileId: TARGET_PROFILE_ONE_COMPETENCE_ID,
  });

  _associateBadgeCriteria(databaseBuilder, toolsBadge);
}

function _createPixDroitBadge(databaseBuilder) {
  const skillIdsForPix = [
    'recybd8jWDNiFpbgq', 'rec4Gvnh9kV1NeMsw', 'rectLj7NPg5JcSIqN', 'rec22kidf1QiHbWwE', 'rec9qal2FLjWysrfu',
    'rec1xAgCoZux1Lxq8', 'rec50IhKadDxbvjES', 'recfQIxf8y4Nrs6M1', 'recPgkHUdzk0HPGt1', 'reclX9KELFBQeVKoC',
    'recJLroTYxcfbczfW', 'reczOCGv8pz976Acl', 'recOrdJPMeAtA9Zse', 'recdmDASRPMTzOmVc', 'recJKLhRCjl9zizHr',
    'rec1vRwGybfjq1Adm', 'rec1BJ9Z7bZRX2zkY', 'recPrXhP0X07OdHXe', 'recVSLpyP7v5vVn9M', 'rec7QdcMIhYfmkgq9',
    'recIkcTpbNZy9YetV', 'recmMMVns3LEFkHeO', 'recfRe4luCCP8GoVA', 'recZbsu9i7LtYnEmx', 'recYLE9xXQelhycvQ',
    'recSt4BLhSGpuu8cn', 'rec0y0EK2ko8YmmKB', 'recJYhsVsioiOFycp', 'recDUnCktq5wj7pZt', 'recagUd44RPEWti0X',
    'recrvTvLTUXEcUIV1', 'recQdr7rbPZ3Kh6Ef', 'recLhYgOVFwOmQSLn', 'rec9IR04aOpn5aSCP', 'recJGN6S3MmTZVa5O',
    'recnaom17JAkKT32Q', 'recINswt85utqO5KJ', 'recUvHMSCCrhtSWS6', 'recdgeyLSVKUpyJF0', 'recfSZlSomGI9PQjn',
    'recg4t3r8Cs7RPKXY', 'recsBYc8s5lDrQDMx', 'rec5JQfWV9brlT8hO', 'recF6K3wLUiBSJCE6', 'recPG9ftlGZLiF0O6',
    'recH1pcEWLBUCqXTm', 'rec4973AsptLwKr5f', 'recPGDVdX0LSOWQQC', 'rec0tk8dZWOzSQbaQ', 'recKbNbM8G7mKaloD',
    'recpdpemRXuzV9r10', 'recZ6RUx2zcIaRAIC', 'recdnFCH9mBrDW06P', 'recUDrhjEYqmfahRX', 'recTR73NgMRmrKRhT',
    'rec3Oe2Z980n3Rdn7', 'recLIyfyDB8US3I6a', 'recL0AotZshb9quhR', 'recrOwaV2PTt1N0i5', 'recI4zS51by3N7Ryi',
    'recrV8JAEsieJOAch', 'receMEAc7Jf2hYll6', 'rec5YCXgs5gMvQHAF', 'recbZos82xPmwuIKC', 'recwKS00LVuYSdCvD',
    'reciVXqruKqnV4haA', 'recGpbqIcGoTPpgSk', 'recaTPKUCD6uAS0li', 'recicaqEeoJUtXT6j', 'recKWLJSisAK7f0Cy',
  ];

  const skillIdsForPixDroitDomain7 = [
    'recVsrqKyTLbbDHr', 'rec1ToyUy6NRAYfsI', 'rec1EDXVReB5W6WXj', 'rec2fBbtPc8wp4KWt', 'rec1ZqFC2J4vnqMKs',
    'rec1a0hrfPTy6Gf0t', 'recOiY1HuWVhoapW', 'rec2Q7Diqgtnz763e', 'recZKD07u0mLyujW', 'rec2N9CictMeBt1WF',
    'rec1EXVl5Brzto10O', 'rec2vtVFViYBr0AiN', 'recNZPgcaDXajM0t', 'rec2h26SD99HTor6U', 'rec2D9DXaRKoWIi2B',
    'rec1yUM0b5yqbJJL2', 'rec1lD19Cd9ABRiRw', 'rec1t5bLr4yky63Ta', 'rec1XGR9DqVYKdYJx', 'rec1rFg4UP2tcoari',
    'rec1NArKsOVyN4EIk', 'recU2zsmTHLjPpk9', 'rec17oEfeJmMCUaqx', 'rec2LAaXB2PVhBtCB', 'rec1diQTFWvp6w30t',
    'rec1UWIIBNSkSeCuL', 'rec2K9f6ZD7lxHv6j', 'recR9RgdSfG6xdcY', 'rec1HP8ydLGZQiNe3', 'rec2yo32jQUEUwaLF',
    'rec1SfkJCdp3sz9FV', 'recVx1cQZCLOcFw4', 'rec29RWcyhULv9vqH', 'rec1489VTqc86A08u', 'recZGo5NepCfhvVn',
    'rec1kB9mwJ5OgSVac',
  ];

  const skillIdsForPixDroitDomain10 = [
    'rec2N7a2V25EtOo65', 'rec2LKsFxZKznouzf', 'rec2l9DgRkwGLvypz', 'rec1hhx0ZAHDp7lbi', 'rec2HxQXDWViDqMIF',
    'rec1WxB9xO0evkNZZ', 'rec17iburXjTGJ16I', 'rec2zRrGzUzcBGlTZ', 'rec1EIYS194JJkxvT', 'rec2Q8JYqSOHR5tXB',
    'rec1q8EaC5p5YgH9t', 'recZZwBpFqbIrBcG', 'rec1HP5Zo3EjjkYMC', 'rec2bl04yHvkQalXp', 'rec176fBLAoLGgCik',
    'rec2CGYVbOHJHfd3s', 'rec2UAabDUGTNPznB', 'rec2X9IfrJH2Bci4D', 'rec1742UQ2u18EvGi', 'rec1qwmvF5buKTbDr',
    'rec1KUfQxRCM55gbC', 'rec2ooiMuIq0oUsnn', 'rec1gdjCWdJiacCjO', 'rec1euSl6Lvv6BRAj', 'rec23O6wwhi16ykUU',
    'rec1bF7RyberJkxo8', 'rec2hdo5JKqc6W1LW', 'rec1MqaeSWF6ctGCI', 'rec1OZXpvNXccAlXH', 'rec1fP6bwoBfuSSt9',
    'rec2Xa4FvWvA1u4EN', 'rec2Upsw0XxepV3aT', 'rec2szR4revLYvA81', 'rec2IHbKRAIatbLhR', 'rec1a3qGSOGR8ASKy',
    'rec1Zj99pTKMJxI3b', 'rec1acCPu874VEndo', 'rec1jatQpmAIRF3zV', 'rec2owv7heER5tzB1', 'rec1iSqZ8hUYHc6k7',
    'rec29zwatZLQvMPhb', 'rec2fkqn6Wg67b2ZA', 'rec2Kmgfh3rhMSLoS', 'rec25uNcX1RvqZmX8', 'rec2gX9NnuZdWH1ev',
    'rec1rwutpqz9BA6uT', 'rec1kiqls8JYsVM7c', 'rec2NlK1kc6Lk5JE8', 'rec2jFSnBm3kgrLhw', 'rec1NM5bUvOaEISj7',
    'rec2BoKMAoj65OQYc', 'rec1XXxlxvnKAzx5d',
  ];

  const skillIdsForPixDroit = skillIdsForPixDroitDomain7.concat(skillIdsForPixDroitDomain10);

  const targetProfileSkillIdsForPixDroitBadge = [
    skillIdsForPix,
    skillIdsForPixDroit,
    skillIdsForPixDroitDomain7,
    skillIdsForPixDroitDomain10,
  ];

  const pixDroitMasterBadge = databaseBuilder.factory.buildBadge({
    id: PIX_DROIT_MAITRE_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix+ Droit MAITRE',
    title: 'Pix+ Droit Maitre',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/socle-de-base.svg',
    key: 'PIX_DROIT_MAITRE_CERTIF',
    message: 'avez validé le badge Pix+ Droit MAITRE',
    isCertifiable: true,
    targetProfileId: TARGET_PROFILE_PIX_DROIT_ID,
  });

  const pixDroitExpertBadge = databaseBuilder.factory.buildBadge({
    id: PIX_DROIT_EXPERT_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix+ Droit EXPERT (et MAITRE)',
    title: 'Pix+ Droit EXPERT (et MAITRE)',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/socle-de-base.svg',
    key: 'PIX_DROIT_EXPERT_CERTIF',
    message: 'avez validé le badge Pix+ Droit EXPERT (et MAITRE)',
    isCertifiable: true,
    targetProfileId: TARGET_PROFILE_PIX_DROIT_ID,
  });

  const badgePartnerCompetencesMasterIds = _associatePixDroitMasterBadgePartnerCompetences(databaseBuilder, targetProfileSkillIdsForPixDroitBadge, pixDroitMasterBadge);
  _associatePixDroitMasterBadgeCriteria(databaseBuilder, pixDroitMasterBadge, badgePartnerCompetencesMasterIds);

  const badgePartnerCompetencesExpertIds = _associatePixDroitExpertBadgePartnerCompetences(databaseBuilder, targetProfileSkillIdsForPixDroitBadge, pixDroitExpertBadge);
  _associatePixDroitExpertBadgeCriteria(databaseBuilder, pixDroitExpertBadge, badgePartnerCompetencesExpertIds);

}

function _returnIds(...builders) {
  return builders.map((builder) => builder.id);
}

function _associateBadgePartnerCompetences(databaseBuilder, targetProfileSkillIds, badge) {
  databaseBuilder.factory.buildBadgePartnerCompetence({
    name: 'Rechercher des informations sur internet',
    color: null,
    skillIds: targetProfileSkillIds[0].map((id) => id),
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name: 'Utiliser des outils informatiques',
    color: null,
    skillIds: targetProfileSkillIds[1].map((id) => id),
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name: 'Naviguer sur internet',
    color: null,
    skillIds: targetProfileSkillIds[2].map((id) => id),
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name: 'Partager sur les réseaux sociaux',
    color: null,
    skillIds: targetProfileSkillIds[3].map((id) => id),
    badgeId: badge.id,
  });
}

function _associateBadgeCriteria(databaseBuilder, badge, badgePartnerCompetencesIds = []) {
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
    threshold: 85,
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
    threshold: 75,
    badgeId: badge.id,
    partnerCompetenceIds: badgePartnerCompetencesIds,
  });
}

function _associatePixDroitMasterBadgePartnerCompetences(databaseBuilder, targetProfileSkillIds, badge) {
  return _returnIds(

    databaseBuilder.factory.buildBadgePartnerCompetence({
      name: 'Acquis du référentiel Pix',
      color: null,
      skillIds: targetProfileSkillIds[0].map((id) => id),
      badgeId: badge.id,
    }),

    databaseBuilder.factory.buildBadgePartnerCompetence({
      name: 'Acquis Pix+ Droit',
      color: null,
      skillIds: targetProfileSkillIds[1].map((id) => id),
      badgeId: badge.id,
    }),

    databaseBuilder.factory.buildBadgePartnerCompetence({
      name: 'Domaine Pix+ Droit Domaine 7',
      color: null,
      skillIds: targetProfileSkillIds[2].map((id) => id),
      badgeId: badge.id,
    }),

    databaseBuilder.factory.buildBadgePartnerCompetence({
      name: 'Domaine Pix+ Droit Domaine 10',
      color: null,
      skillIds: targetProfileSkillIds[3].map((id) => id),
      badgeId: badge.id,
    }),
  );
}

function _associatePixDroitExpertBadgePartnerCompetences(databaseBuilder, targetProfileSkillIds, badge) {
  return _returnIds(
    databaseBuilder.factory.buildBadgePartnerCompetence({
      name: 'Acquis du référentiel Pix',
      color: null,
      skillIds: targetProfileSkillIds[0].map((id) => id),
      badgeId: badge.id,
    }),

    databaseBuilder.factory.buildBadgePartnerCompetence({
      name: 'Acquis Pix+ Droit',
      color: null,
      skillIds: targetProfileSkillIds[1].map((id) => id),
      badgeId: badge.id,
    }),

    databaseBuilder.factory.buildBadgePartnerCompetence({
      name: 'Domaine Pix+ Droit Domaine 7',
      color: null,
      skillIds: targetProfileSkillIds[2].map((id) => id),
      badgeId: badge.id,
    }),

    databaseBuilder.factory.buildBadgePartnerCompetence({
      name: 'Domaine Pix+ Droit Domaine 10',
      color: null,
      skillIds: targetProfileSkillIds[3].map((id) => id),
      badgeId: badge.id,
    }),
  );
}

function _associatePixDroitMasterBadgeCriteria(databaseBuilder, badge, badgePartnerCompetencesIds) {
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SOME_PARTNER_COMPETENCES,
    threshold: 70,
    badgeId: badge.id,
    partnerCompetenceIds: [badgePartnerCompetencesIds[0]],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SOME_PARTNER_COMPETENCES,
    threshold: 60,
    badgeId: badge.id,
    partnerCompetenceIds: [badgePartnerCompetencesIds[1]],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SOME_PARTNER_COMPETENCES,
    threshold: 40,
    badgeId: badge.id,
    partnerCompetenceIds: [badgePartnerCompetencesIds[2], badgePartnerCompetencesIds[3]],
  });
}

function _associatePixDroitExpertBadgeCriteria(databaseBuilder, badge, badgePartnerCompetencesIds) {
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SOME_PARTNER_COMPETENCES,
    threshold: 70,
    badgeId: badge.id,
    partnerCompetenceIds: [badgePartnerCompetencesIds[0]],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SOME_PARTNER_COMPETENCES,
    threshold: 80,
    badgeId: badge.id,
    partnerCompetenceIds: [badgePartnerCompetencesIds[1]],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SOME_PARTNER_COMPETENCES,
    threshold: 40,
    badgeId: badge.id,
    partnerCompetenceIds: [badgePartnerCompetencesIds[2], badgePartnerCompetencesIds[3]],
  });
}

module.exports = {
  badgesBuilder,
  PIX_EMPLOI_CLEA_BADGE_ID,
  BASICS_BADGE_ID,
  TOOLS_BADGE_ID,
  MANIP_BADGE_ID,
  PRO_BASICS_BADGE_ID,
  PRO_TOOLS_BADGE_ID,
  PIX_DROIT_MAITRE_BADGE_ID,
  PIX_DROIT_EXPERT_BADGE_ID,
};
