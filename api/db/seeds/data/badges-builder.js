const BADGE_TEST_ID = 111;
const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');

function badgesBuilder({ databaseBuilder }) {

  const targetProfileId = 984165;

  const targetProfileSkillIds = [
    'rectL2ZZeWPc7yezp', 'recndXqXiv4pv2Ukp', 'recMOy4S8XnaWblYI', 'recagUd44RPEWti0X',
    'recrvTvLTUXEcUIV1', 'recX7RyCsdNV2p168', 'recxtb5aLs6OAAKIg', 'receRbbt9Lb661wFB',
    'rec71e3PSct2zLEMj', 'recFwJlpllhWzuLom', 'rec0J9OXaAj5v7w3r', 'reclY3njuk6EySJuU',
    'rec5V9gp65a58nnco', 'recPrXhP0X07OdHXe', 'recPG9ftlGZLiF0O6', 'rectLj7NPg5JcSIqN',
    'rec9qal2FLjWysrfu', 'rechRPFlSryfY3UnG', 'recL0AotZshb9quhR', 'recrOwaV2PTt1N0i5',
    'recpdpemRXuzV9r10', 'recWXtN5cNP1JQUVx', 'recTIddrkopID28Ep', 'recBrDIfDDW2IPpZV',
    'recgOc2OreHCosoRp'
  ];

  const badge = databaseBuilder.factory.buildBadge({
    id: BADGE_TEST_ID,
    altMessage: 'Vous avez validé le badge Pix Emploi.',
    title: 'Pix Emploi',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/Pix-emploi.svg',
    key: 'Other key',
    message: 'Bravo ! Vous maîtrisez les compétences indispensables pour utiliser le numérique en milieu professionnel. ' +
      'Pour valoriser vos compétences avec une double certification Pix-CléA numérique, renseignez-vous auprès de votre conseiller ou de votre formateur.',
    targetProfileId,
  });

  _associateBadgePartnerCompetences(databaseBuilder, targetProfileSkillIds, badge);
  _associateBadgeCriteria(databaseBuilder, badge);
}

function _associateBadgePartnerCompetences(databaseBuilder, targetProfileSkillIds, badge) {
  databaseBuilder.factory.buildBadgePartnerCompetence({
    name: 'Rechercher des informations sur internet',
    color: null,
    skillIds: [
      targetProfileSkillIds[0],
      targetProfileSkillIds[1],
      targetProfileSkillIds[2],
      targetProfileSkillIds[3],
      targetProfileSkillIds[4],
      targetProfileSkillIds[5],
      targetProfileSkillIds[6],
      targetProfileSkillIds[7],
      targetProfileSkillIds[8],
      targetProfileSkillIds[9],
    ],
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name: 'Utiliser des outils informatiques',
    color: null,
    skillIds: [
      targetProfileSkillIds[10],
      targetProfileSkillIds[11],
      targetProfileSkillIds[12],
      targetProfileSkillIds[13],
      targetProfileSkillIds[14],
      targetProfileSkillIds[15],
    ],
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name: 'Naviguer sur internet',
    color: null,
    skillIds: [
      targetProfileSkillIds[16],
      targetProfileSkillIds[17],
      targetProfileSkillIds[18],
      targetProfileSkillIds[19],
      targetProfileSkillIds[20],
      targetProfileSkillIds[21],
    ],
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name: 'Partager sur les réseaux sociaux',
    color: null,
    skillIds: [
      targetProfileSkillIds[22],
      targetProfileSkillIds[23],
      targetProfileSkillIds[24],
    ],
    badgeId: badge.id,
  });
}
function _associateBadgeCriteria(databaseBuilder, badge) {
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
    threshold: 85,
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
    threshold: 75,
    badgeId: badge.id,
  });
}

module.exports = {
  badgesBuilder,
  BADGE_PIX_EMPLOI_ID: BADGE_TEST_ID,
};
