const PIX_EMPLOI_CLEA_BADGE_ID_V1 = 100;
const BASICS_BADGE_ID = 111;
const TOOLS_BADGE_ID = 112;
const MANIP_BADGE_ID = 113;
const PRO_BASICS_BADGE_ID = 114;
const PRO_TOOLS_BADGE_ID = 115;
const PIX_DROIT_MAITRE_BADGE_ID = 116;
const PIX_DROIT_EXPERT_BADGE_ID = 117;
const PIX_EMPLOI_CLEA_BADGE_ID_V2 = 118;
const PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE_BADGE_ID = 119;
const PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME_BADGE_ID = 120;
const PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME_BADGE_ID = 121;
const PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE_BADGE_ID = 122;
const PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT_BADGE_ID = 123;
const PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE_BADGE_ID = 124;
const PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME_BADGE_ID = 125;
const PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME_BADGE_ID = 126;
const PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE_BADGE_ID = 127;
const PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT_BADGE_ID = 128;
const PIX_EMPLOI_CLEA_BADGE_ID_V3 = 129;

import BadgeCriterion from '../../../lib/domain/models/BadgeCriterion';
import { badges } from '../../constants';

import {
  targetProfileSkillIdsForCleaBadgeV1,
  targetProfileSkillIdsForCleaBadgeV2,
  targetProfileSkillIdsForCleaBadgeV3,
  TARGET_PROFILE_STAGES_BADGES_ID,
  TARGET_PROFILE_ONE_COMPETENCE_ID,
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V2,
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V3,
  TARGET_PROFILE_PIX_DROIT_ID,
  TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
  TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE,
  TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_1ER_DEGRE,
  TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE,
} from './target-profiles-builder';

function badgesBuilder({ databaseBuilder }) {
  _createBasicsBadge(databaseBuilder);
  _createToolsBadge(databaseBuilder);
  _createManipBadge(databaseBuilder);
  _createProfessionalBasicsBadge(databaseBuilder);
  _createProfessionalToolsBadge(databaseBuilder);
  _createPixDroitBadge(databaseBuilder);
  _createPixEmploiCleaBadgeV1(databaseBuilder);
  _createPixEmploiCleaBadgeV2(databaseBuilder);
  _createPixEmploiCleaBadgeV3(databaseBuilder);
  _createPixEduBadges(databaseBuilder);
}

function _createPixEmploiCleaBadge({ databaseBuilder, id, key, targetProfileId, skillIdsForSkillSets }) {
  const badge = databaseBuilder.factory.buildBadge({
    id,
    altMessage: 'Vous avez validé le badge Pix Emploi.',
    title: 'Pix Emploi - Clea',
    imageUrl: 'https://images.pix.fr/badges/Pix-emploi.svg',
    key,
    message:
      'Bravo ! Vous maîtrisez les compétences indispensables pour utiliser le numérique en milieu professionnel. ' +
      'Pour valoriser vos compétences avec une double certification Pix-CléA numérique, renseignez-vous auprès de votre conseiller ou de votre formateur.',
    targetProfileId,
    isCertifiable: true,
  });

  const skillSetsIds = _associateSkillSets(databaseBuilder, skillIdsForSkillSets, badge);
  _associateBadgeCriteria(databaseBuilder, badge, skillSetsIds);
}

function _createPixEmploiCleaBadgeV1(databaseBuilder) {
  return _createPixEmploiCleaBadge({
    databaseBuilder,
    id: PIX_EMPLOI_CLEA_BADGE_ID_V1,
    key: badges.keys.PIX_EMPLOI_CLEA_V1,
    targetProfileId: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
    skillIdsForSkillSets: targetProfileSkillIdsForCleaBadgeV1,
  });
}

function _createPixEmploiCleaBadgeV2(databaseBuilder) {
  return _createPixEmploiCleaBadge({
    databaseBuilder,
    id: PIX_EMPLOI_CLEA_BADGE_ID_V2,
    key: badges.keys.PIX_EMPLOI_CLEA_V2,
    targetProfileId: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V2,
    skillIdsForSkillSets: targetProfileSkillIdsForCleaBadgeV2,
  });
}

function _createPixEmploiCleaBadgeV3(databaseBuilder) {
  return _createPixEmploiCleaBadge({
    databaseBuilder,
    id: PIX_EMPLOI_CLEA_BADGE_ID_V3,
    key: badges.keys.PIX_EMPLOI_CLEA_V3,
    targetProfileId: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V3,
    skillIdsForSkillSets: targetProfileSkillIdsForCleaBadgeV3,
  });
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
    imageUrl: 'https://images.pix.fr/badges/socle-de-base.svg',
    key: 'Basics',
    message:
      'Bravo ! Vous maîtrisez quelques bases du numérique comme le vocabulaire, la manipulation basique ou l\'utilisation d\'outils',
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
  });

  const skillSetsIds = _associateSkillSets(databaseBuilder, targetProfileSkillIdsForBasicsBadge, basicsBadge);
  _associateBadgeCriteria(databaseBuilder, basicsBadge, skillSetsIds);
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
    imageUrl: 'https://images.pix.fr/badges/pro-recherche.svg',
    key: 'Tools',
    message:
      'Vous reconnaissez les éléments courants du numérique: le matériel, la messagerie, un document et un navigateur WEB.',
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
  });

  const skillSetsIds = _associateSkillSets(databaseBuilder, targetProfileSkillIdsForToolsBadge, toolsBadge);
  _associateBadgeCriteria(databaseBuilder, toolsBadge, skillSetsIds);
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
    imageUrl: 'https://images.pix.fr/badges/office.svg',
    key: 'Manip',
    message:
      'Vous maîtrisez les gestes de base : le clic, la saisie de texte et la navigation entre onglets d\'un navigateur WEB',
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
  });

  const skillSetsIds = _associateSkillSets(databaseBuilder, targetProfileSkillIdsForManipBadge, manipBadge);
  _associateBadgeCriteria(databaseBuilder, manipBadge, skillSetsIds);
}

function _createProfessionalBasicsBadge(databaseBuilder) {
  const basicsBadge = databaseBuilder.factory.buildBadge({
    id: PRO_BASICS_BADGE_ID,
    altMessage: 'Vous avez validé les bases professionnelles.',
    title: 'Bases professionnelles',
    imageUrl: 'https://images.pix.fr/badges/socle-de-base.svg',
    key: 'Pro Basics',
    message: 'Bravo ! Vous maîtrisez quelques bases  du numérique pour le monde professionnel !',
    targetProfileId: TARGET_PROFILE_ONE_COMPETENCE_ID,
  });

  _associateBadgeCriteria(databaseBuilder, basicsBadge, []);
}

function _createProfessionalToolsBadge(databaseBuilder) {
  const toolsBadge = databaseBuilder.factory.buildBadge({
    id: PRO_TOOLS_BADGE_ID,
    altMessage: 'Vous avez validé le Vocabulaire et outils professionels du numérique.',
    title: 'Vocabulaire et outils professionnels du numérique',
    imageUrl: 'https://images.pix.fr/badges/pro-recherche.svg',
    key: 'Pro Tools',
    message:
      'Vous reconnaissez les éléments courants professionnels du numérique: le matériel, la messagerie, un document et un navigateur WEB.',
    targetProfileId: TARGET_PROFILE_ONE_COMPETENCE_ID,
  });

  _associateBadgeCriteria(databaseBuilder, toolsBadge, []);
}

function _createPixDroitBadge(databaseBuilder) {
  const skillIdsForPix = [
    'recybd8jWDNiFpbgq',
    'rec4Gvnh9kV1NeMsw',
    'rectLj7NPg5JcSIqN',
    'rec22kidf1QiHbWwE',
    'rec9qal2FLjWysrfu',
    'rec1xAgCoZux1Lxq8',
    'rec50IhKadDxbvjES',
    'recfQIxf8y4Nrs6M1',
    'recPgkHUdzk0HPGt1',
    'reclX9KELFBQeVKoC',
    'recJLroTYxcfbczfW',
    'reczOCGv8pz976Acl',
    'recOrdJPMeAtA9Zse',
    'recdmDASRPMTzOmVc',
    'recJKLhRCjl9zizHr',
    'rec1vRwGybfjq1Adm',
    'rec1BJ9Z7bZRX2zkY',
    'recPrXhP0X07OdHXe',
    'recVSLpyP7v5vVn9M',
    'rec7QdcMIhYfmkgq9',
    'recIkcTpbNZy9YetV',
    'recmMMVns3LEFkHeO',
    'recfRe4luCCP8GoVA',
    'recZbsu9i7LtYnEmx',
    'recYLE9xXQelhycvQ',
    'recSt4BLhSGpuu8cn',
    'rec0y0EK2ko8YmmKB',
    'recJYhsVsioiOFycp',
    'recDUnCktq5wj7pZt',
    'recagUd44RPEWti0X',
    'recrvTvLTUXEcUIV1',
    'recQdr7rbPZ3Kh6Ef',
    'recLhYgOVFwOmQSLn',
    'rec9IR04aOpn5aSCP',
    'recJGN6S3MmTZVa5O',
    'recnaom17JAkKT32Q',
    'recINswt85utqO5KJ',
    'recUvHMSCCrhtSWS6',
    'recdgeyLSVKUpyJF0',
    'recfSZlSomGI9PQjn',
    'recg4t3r8Cs7RPKXY',
    'recsBYc8s5lDrQDMx',
    'rec5JQfWV9brlT8hO',
    'recF6K3wLUiBSJCE6',
    'recPG9ftlGZLiF0O6',
    'recH1pcEWLBUCqXTm',
    'rec4973AsptLwKr5f',
    'recPGDVdX0LSOWQQC',
    'rec0tk8dZWOzSQbaQ',
    'recKbNbM8G7mKaloD',
    'recpdpemRXuzV9r10',
    'recZ6RUx2zcIaRAIC',
    'recdnFCH9mBrDW06P',
    'recUDrhjEYqmfahRX',
    'recTR73NgMRmrKRhT',
    'rec3Oe2Z980n3Rdn7',
    'recLIyfyDB8US3I6a',
    'recL0AotZshb9quhR',
    'recrOwaV2PTt1N0i5',
    'recI4zS51by3N7Ryi',
    'recrV8JAEsieJOAch',
    'receMEAc7Jf2hYll6',
    'rec5YCXgs5gMvQHAF',
    'recbZos82xPmwuIKC',
    'recwKS00LVuYSdCvD',
    'reciVXqruKqnV4haA',
    'recGpbqIcGoTPpgSk',
    'recaTPKUCD6uAS0li',
    'recicaqEeoJUtXT6j',
    'recKWLJSisAK7f0Cy',
  ];

  const skillIdsForPixDroitDomain7 = [
    'recVsrqKyTLbbDHr',
    'rec1ToyUy6NRAYfsI',
    'rec1EDXVReB5W6WXj',
    'rec2fBbtPc8wp4KWt',
    'rec1ZqFC2J4vnqMKs',
    'rec1a0hrfPTy6Gf0t',
    'recOiY1HuWVhoapW',
    'rec2Q7Diqgtnz763e',
    'recZKD07u0mLyujW',
    'rec2N9CictMeBt1WF',
    'rec1EXVl5Brzto10O',
    'rec2vtVFViYBr0AiN',
    'recNZPgcaDXajM0t',
    'rec2h26SD99HTor6U',
    'rec2D9DXaRKoWIi2B',
    'rec1yUM0b5yqbJJL2',
    'rec1lD19Cd9ABRiRw',
    'rec1t5bLr4yky63Ta',
    'rec1XGR9DqVYKdYJx',
    'rec1rFg4UP2tcoari',
    'rec1NArKsOVyN4EIk',
    'recU2zsmTHLjPpk9',
    'rec17oEfeJmMCUaqx',
    'rec2LAaXB2PVhBtCB',
    'rec1diQTFWvp6w30t',
    'rec1UWIIBNSkSeCuL',
    'rec2K9f6ZD7lxHv6j',
    'recR9RgdSfG6xdcY',
    'rec1HP8ydLGZQiNe3',
    'rec2yo32jQUEUwaLF',
    'rec1SfkJCdp3sz9FV',
    'recVx1cQZCLOcFw4',
    'rec29RWcyhULv9vqH',
    'rec1489VTqc86A08u',
    'recZGo5NepCfhvVn',
    'rec1kB9mwJ5OgSVac',
  ];

  const skillIdsForPixDroitDomain10 = [
    'rec2N7a2V25EtOo65',
    'rec2LKsFxZKznouzf',
    'rec2l9DgRkwGLvypz',
    'rec1hhx0ZAHDp7lbi',
    'rec2HxQXDWViDqMIF',
    'rec1WxB9xO0evkNZZ',
    'rec17iburXjTGJ16I',
    'rec2zRrGzUzcBGlTZ',
    'rec1EIYS194JJkxvT',
    'rec2Q8JYqSOHR5tXB',
    'rec1q8EaC5p5YgH9t',
    'recZZwBpFqbIrBcG',
    'rec1HP5Zo3EjjkYMC',
    'rec2bl04yHvkQalXp',
    'rec176fBLAoLGgCik',
    'rec2CGYVbOHJHfd3s',
    'rec2UAabDUGTNPznB',
    'rec2X9IfrJH2Bci4D',
    'rec1742UQ2u18EvGi',
    'rec1qwmvF5buKTbDr',
    'rec1KUfQxRCM55gbC',
    'rec2ooiMuIq0oUsnn',
    'rec1gdjCWdJiacCjO',
    'rec1euSl6Lvv6BRAj',
    'rec23O6wwhi16ykUU',
    'rec1bF7RyberJkxo8',
    'rec2hdo5JKqc6W1LW',
    'rec1MqaeSWF6ctGCI',
    'rec1OZXpvNXccAlXH',
    'rec1fP6bwoBfuSSt9',
    'rec2Xa4FvWvA1u4EN',
    'rec2Upsw0XxepV3aT',
    'rec2szR4revLYvA81',
    'rec2IHbKRAIatbLhR',
    'rec1a3qGSOGR8ASKy',
    'rec1Zj99pTKMJxI3b',
    'rec1acCPu874VEndo',
    'rec1jatQpmAIRF3zV',
    'rec2owv7heER5tzB1',
    'rec1iSqZ8hUYHc6k7',
    'rec29zwatZLQvMPhb',
    'rec2fkqn6Wg67b2ZA',
    'rec2Kmgfh3rhMSLoS',
    'rec25uNcX1RvqZmX8',
    'rec2gX9NnuZdWH1ev',
    'rec1rwutpqz9BA6uT',
    'rec1kiqls8JYsVM7c',
    'rec2NlK1kc6Lk5JE8',
    'rec2jFSnBm3kgrLhw',
    'rec1NM5bUvOaEISj7',
    'rec2BoKMAoj65OQYc',
    'rec1XXxlxvnKAzx5d',
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
    imageUrl: 'https://images.pix.fr/badges/socle-de-base.svg',
    key: 'PIX_DROIT_MAITRE_CERTIF',
    message: 'avez validé le badge Pix+ Droit MAITRE',
    isCertifiable: true,
    targetProfileId: TARGET_PROFILE_PIX_DROIT_ID,
  });

  const pixDroitExpertBadge = databaseBuilder.factory.buildBadge({
    id: PIX_DROIT_EXPERT_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix+ Droit EXPERT (et MAITRE)',
    title: 'Pix+ Droit EXPERT (et MAITRE)',
    imageUrl: 'https://images.pix.fr/badges/socle-de-base.svg',
    key: 'PIX_DROIT_EXPERT_CERTIF',
    message: 'avez validé le badge Pix+ Droit EXPERT (et MAITRE)',
    isCertifiable: true,
    targetProfileId: TARGET_PROFILE_PIX_DROIT_ID,
  });

  const skillSetsMasterIds = _associatePixDroitMasterSkillSets(
    databaseBuilder,
    targetProfileSkillIdsForPixDroitBadge,
    pixDroitMasterBadge,
  );
  _associatePixDroitMasterBadgeCriteria(databaseBuilder, pixDroitMasterBadge, skillSetsMasterIds);

  const skillSetsExpertIds = _associatePixDroitExpertSkillSets(
    databaseBuilder,
    targetProfileSkillIdsForPixDroitBadge,
    pixDroitExpertBadge,
  );
  _associatePixDroitExpertBadgeCriteria(databaseBuilder, pixDroitExpertBadge, skillSetsExpertIds);
}

function _createPixEduBadges(databaseBuilder) {
  const skillIdsForPixEduDomain1 = [
    'rec15yReQYTFrSt4B',
    'rec1Wkqw3nuHgIiIM',
    'rec1j6CiXiURb2CHx',
    'rec1Amct83clkurHS',
    'rec1ekgLbl2OHiS2K',
    'rec14jR3q6L4YhvhL',
    'rec20QPg2JCWeRlwT',
    'rec2cnUBnVRnO8Bha',
    'rec2HwskucZtT4O2C',
    'recPr5ClMsBGcYIV',
    'recR8sdouZZjY0mV',
  ];

  const skillIdsForPixEduDomain2 = [
    'rec2VUmfYHsCt3Xgn',
    'rec1w6nZsb68eSxDh',
    'rec1waG4ibaZS7WYY',
    'rec1EUjw8czJj40JI',
    'recPH84RB6iqHkFH',
    'rec1LZeDXuMFiDxWa',
    'skill2OTKzrFuYPadQE',
    'rec2BmkSgPUbXJJ0Y',
    'rec2SNc48TxxRQSue',
    'rec2vsS9ZtT1z2Txb',
    'rec1ERSB85H4PA4SR',
    'rec12AsSoWBadXgdl',
    'recL8znWTv2HWwbW',
    'rec2PWfuWoWagrlY4',
    'rec2A8SAqQMfZQ7NK',
    'rec254TTW8EvdImzq',
    'rec2NbKkZN8gFy3FZ',
    'rec25v7ZleWGcvo4d',
    'rec2jP5V76SOU9Y04',
    'rec1aetrWEVisVDrH',
    'rec2K1Mc9n8xOqOMP',
    'skill2rcH2vsFpAiT6p',
    'skill1qjh1GbjGh9Vns',
    'skillOf3dZo931fV48',
    'skill1uNgT2xU9D74n0',
  ];

  const skillIdsForPixEduDomain3 = [
    'skillU67GhtfYVqwpv',
    'skill1Twmb1rZDsEfE7',
    'skill1g8g5coZkQXX4M',
    'skill1ToY2ZTwexaBKp',
    'skill1ny2KMgLu71jix',
    'skill2ISuQfal7rbaXh',
    'skillTZmYxFt743voi',
    'skill14fiWIKaERX7BR',
    'skill1uNdYxAX52fa62',
    'skill1bE4gey9aNqbQZ',
    'skill1WGPxbmhES4Oxa',
    'skillRl8tfFE9xYJk4',
    'skill2jNkrWFT4ba4Sf',
    'skill2blmVwXGktteHR',
    'skill2RAlN7ni693ddG',
    'skill12UEhLVQ48X4rr',
    'skill1klA1Gi5zQzrJx',
    'skillVGB3FAtHy8dyO',
    'skill11kT7wWx6zFn2w',
    'skill1iIU3e7xGYwprq',
    'skill2VV8u1UcI9NCXh',
    'skill1ENYO2RGUPH5SM',
    'skill22qk75PwZDqWoy',
    'skill1teNFy22tZIfg7',
    'skill1yZOkOIZTmJ3jY',
    'skill2OLetxPA9DUVPt',
    'skill109q79DREbmhuD',
    'skill2FH5lzEpU7W9WP',
    'skillO0bQ18VLVX9Gb',
    'skill1PnlqHmqg1eunf',
    'skill1GxkFDjxcI0cKc',
    'skillUdOw1VhFGekoY',
    'skill20U57sLssgVzMb',
    'skill2fxgLE6DRN9chS',
    'skill2SPl2q6wyNHn6D',
    'skill1M8JfBs4DJbZ2u',
    'skill1uKpAYnqPOPJmm',
    'skill2XtWpclIQphAw7',
    'skill1Y9XCwamT0vWAL',
    'skill1KDyr0D7Vk0l65',
    'skillPuGQjQ5eJQIxv',
    'skill2ifeuYKWvCIdqe',
  ];

  const pixEduFormationInitiale2ndDegreInitieBadge = databaseBuilder.factory.buildBadge({
    id: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix+ Édu 2nd degré - Initié (entrée dans le métier)',
    title: 'Pix+ Édu 2nd degré - Initié (entrée dans le métier)',
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-1-Initie.svg',
    key: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE',
    message: 'avez validé le badge Pix+ Édu 2nd degré - Initié (entrée dans le métier)',
    isCertifiable: true,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
  });
  const [domain1Initie2ndDegreSkillSetId, domain2Initie2ndDegreSkillSetId] = _associatePixEduFormationInitialeSkillSets(
    databaseBuilder,
    skillIdsForPixEduDomain1,
    skillIdsForPixEduDomain2,
    pixEduFormationInitiale2ndDegreInitieBadge,
  );
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 40,
    badgeId: pixEduFormationInitiale2ndDegreInitieBadge.id,
    skillSetIds: [domain1Initie2ndDegreSkillSetId],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 40,
    badgeId: pixEduFormationInitiale2ndDegreInitieBadge.id,
    skillSetIds: [domain2Initie2ndDegreSkillSetId],
  });

  const pixEduFormationInitiale1erDegreInitieBadge = databaseBuilder.factory.buildBadge({
    id: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix+ Édu 1er degré - Initié (entrée dans le métier)',
    title: 'Pix+ Édu 1er degré - Initié (entrée dans le métier)',
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-1-Initie.svg',
    key: 'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE',
    message: 'avez validé le badge Pix+ Édu 1er degré - Initié (entrée dans le métier)',
    isCertifiable: true,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_1ER_DEGRE,
  });
  const [domain1Initie1SkillSetId, domain2Initie1erDegreSkillSetId] = _associatePixEduFormationInitialeSkillSets(
    databaseBuilder,
    skillIdsForPixEduDomain1,
    skillIdsForPixEduDomain2,
    pixEduFormationInitiale1erDegreInitieBadge,
  );
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 40,
    badgeId: pixEduFormationInitiale1erDegreInitieBadge.id,
    skillSetIds: [domain1Initie1SkillSetId],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 40,
    badgeId: pixEduFormationInitiale1erDegreInitieBadge.id,
    skillSetIds: [domain2Initie1erDegreSkillSetId],
  });

  const pixEduFormationInitiale2ndDegreConfirmeBadge = databaseBuilder.factory.buildBadge({
    id: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix+ Édu 2nd degré - Confirmé',
    title: 'Pix+ Édu 2nd degré - Confirmé',
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme.svg',
    key: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME',
    message: 'avez validé le badge Pix+ Édu 2nd degré - Confirmé',
    isCertifiable: true,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
  });
  const [domain1Confirme2ndDegreSkillSetId, domain2Confirme2ndDegreSkillSetId] = _associatePixEduFormationInitialeSkillSets(
    databaseBuilder,
    skillIdsForPixEduDomain1,
    skillIdsForPixEduDomain2,
    pixEduFormationInitiale2ndDegreConfirmeBadge,
  );
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 60,
    badgeId: pixEduFormationInitiale2ndDegreConfirmeBadge.id,
    skillSetIds: [domain1Confirme2ndDegreSkillSetId],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 60,
    badgeId: pixEduFormationInitiale2ndDegreConfirmeBadge.id,
    skillSetIds: [domain2Confirme2ndDegreSkillSetId],
  });

  const pixEduFormationInitiale1erDegreConfirmeBadge = databaseBuilder.factory.buildBadge({
    id: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix+ Édu 1er degré - Confirmé',
    title: 'Pix+ Édu 2nd degré - Confirmé',
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme.svg',
    key: 'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME',
    message: 'avez validé le badge Pix+ Édu 1er degré - Confirmé',
    isCertifiable: true,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_1ER_DEGRE,
  });
  const [domain1Confirme1erDegreSkillSetId, domain2Confirme1erDegreSkillSetId] = _associatePixEduFormationInitialeSkillSets(
    databaseBuilder,
    skillIdsForPixEduDomain1,
    skillIdsForPixEduDomain2,
    pixEduFormationInitiale1erDegreConfirmeBadge,
  );
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 60,
    badgeId: pixEduFormationInitiale1erDegreConfirmeBadge.id,
    skillSetIds: [domain1Confirme1erDegreSkillSetId],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 60,
    badgeId: pixEduFormationInitiale1erDegreConfirmeBadge.id,
    skillSetIds: [domain2Confirme1erDegreSkillSetId],
  });

  const pixEduFormationContinue2ndDegreConfirmeBadge = databaseBuilder.factory.buildBadge({
    id: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix+ Édu 2nd degré - Confirmé',
    title: 'Pix+ Édu 2nd degré - Confirmé',
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme.svg',
    key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME',
    message: 'avez validé le badge Pix+ Édu 2nd degré - Confirmé',
    isCertifiable: true,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE,
  });
  const [domain3Confirme2ndDegreSkillSetId] = _associatePixEduFormationContinueSkillSets(
    databaseBuilder,
    skillIdsForPixEduDomain3,
    pixEduFormationContinue2ndDegreConfirmeBadge,
  );
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 40,
    badgeId: pixEduFormationContinue2ndDegreConfirmeBadge.id,
    skillSetIds: [domain3Confirme2ndDegreSkillSetId],
  });

  const pixEduFormationContinue1erDegreConfirmeBadge = databaseBuilder.factory.buildBadge({
    id: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix+ Édu 1er degré - Confirmé',
    title: 'Pix+ Édu 1er degré - Confirmé',
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme.svg',
    key: 'PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME',
    message: 'avez validé le badge Pix+ Édu 1er degré - Confirmé',
    isCertifiable: true,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE,
  });
  const [domain3Confirme1erDegreSkillSetId] = _associatePixEduFormationContinueSkillSets(
    databaseBuilder,
    skillIdsForPixEduDomain3,
    pixEduFormationContinue1erDegreConfirmeBadge,
  );
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 40,
    badgeId: pixEduFormationContinue1erDegreConfirmeBadge.id,
    skillSetIds: [domain3Confirme1erDegreSkillSetId],
  });

  const pixEduFormationContinue2ndDegreAvanceBadge = databaseBuilder.factory.buildBadge({
    id: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix+ Édu 2nd degré - Avancé',
    title: 'Pix+ Édu 2nd degré - Avancé',
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-3-Avance.svg',
    key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE',
    message: 'avez validé le badge Pix+ Édu 2nd degré - Avancé',
    isCertifiable: true,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE,
  });
  const [domain3Avance2ndDegreSkillSetId] = _associatePixEduFormationContinueSkillSets(
    databaseBuilder,
    skillIdsForPixEduDomain3,
    pixEduFormationContinue2ndDegreAvanceBadge,
  );
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 60,
    badgeId: pixEduFormationContinue2ndDegreAvanceBadge.id,
    skillSetIds: [domain3Avance2ndDegreSkillSetId],
  });

  const pixEduFormationContinue1erDegreAvanceBadge = databaseBuilder.factory.buildBadge({
    id: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix+ Édu 1er degré - Avancé',
    title: 'Pix+ Édu 1er degré - Avancé',
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-3-Avance.svg',
    key: 'PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE',
    message: 'avez validé le badge Pix+ Édu 1er degré - Avancé',
    isCertifiable: true,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE,
  });
  const [domain3Avance1erDegreSkillSetId] = _associatePixEduFormationContinueSkillSets(
    databaseBuilder,
    skillIdsForPixEduDomain3,
    pixEduFormationContinue1erDegreAvanceBadge,
  );
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 60,
    badgeId: pixEduFormationContinue1erDegreAvanceBadge.id,
    skillSetIds: [domain3Avance1erDegreSkillSetId],
  });

  const pixEduFormationContinue2ndDegreExpertBadge = databaseBuilder.factory.buildBadge({
    id: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix+ Édu 2nd degré - Expert',
    title: 'Pix+ Édu 2nd degré - Expert',
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-4-Expert.svg',
    key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT',
    message: 'avez validé le badge Pix+ Édu 2nd degré - Expert',
    isCertifiable: true,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE,
  });
  const [domain3Expert2ndDegreSkillSetId] = _associatePixEduFormationContinueSkillSets(
    databaseBuilder,
    skillIdsForPixEduDomain3,
    pixEduFormationContinue2ndDegreExpertBadge,
  );
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 80,
    badgeId: pixEduFormationContinue2ndDegreExpertBadge.id,
    skillSetIds: [domain3Expert2ndDegreSkillSetId],
  });

  const pixEduFormationContinue1erDegreExpertBadge = databaseBuilder.factory.buildBadge({
    id: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix+ Édu 1er degré - Expert',
    title: 'Pix+ Édu 1er degré - Expert',
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-4-Expert.svg',
    key: 'PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT',
    message: 'avez validé le badge Pix+ Édu 1er degré - Expert',
    isCertifiable: true,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE,
  });
  const [domain3Expert1erDegreSkillSetId] = _associatePixEduFormationContinueSkillSets(
    databaseBuilder,
    skillIdsForPixEduDomain3,
    pixEduFormationContinue1erDegreExpertBadge,
  );
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 80,
    badgeId: pixEduFormationContinue1erDegreExpertBadge.id,
    skillSetIds: [domain3Expert1erDegreSkillSetId],
  });
}

function _returnIds(...builders) {
  return builders.map((builder) => builder.id);
}

function _associateSkillSets(databaseBuilder, targetProfileSkillIds, badge) {
  return _returnIds(
    databaseBuilder.factory.buildSkillSet({
      name: 'Rechercher des informations sur internet',
      skillIds: targetProfileSkillIds[0].map((id) => id),
      badgeId: badge.id,
    }),
    databaseBuilder.factory.buildSkillSet({
      name: 'Utiliser des outils informatiques',
      skillIds: targetProfileSkillIds[1].map((id) => id),
      badgeId: badge.id,
    }),
    databaseBuilder.factory.buildSkillSet({
      name: 'Naviguer sur internet',
      skillIds: targetProfileSkillIds[2].map((id) => id),
      badgeId: badge.id,
    }),
    databaseBuilder.factory.buildSkillSet({
      name: 'Partager sur les réseaux sociaux',
      skillIds: targetProfileSkillIds[3].map((id) => id),
      badgeId: badge.id,
    }),
  );
}

function _associateBadgeCriteria(databaseBuilder, badge, skillSetsIds = []) {
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
    threshold: 85,
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 75,
    badgeId: badge.id,
    skillSetIds: skillSetsIds,
  });
}

function _associatePixDroitMasterSkillSets(databaseBuilder, targetProfileSkillIds, badge) {
  return _returnIds(
    databaseBuilder.factory.buildSkillSet({
      name: 'Acquis du référentiel Pix',
      skillIds: targetProfileSkillIds[0].map((id) => id),
      badgeId: badge.id,
    }),

    databaseBuilder.factory.buildSkillSet({
      name: 'Acquis Pix+ Droit',
      skillIds: targetProfileSkillIds[1].map((id) => id),
      badgeId: badge.id,
    }),

    databaseBuilder.factory.buildSkillSet({
      name: 'Domaine Pix+ Droit Domaine 7',
      skillIds: targetProfileSkillIds[2].map((id) => id),
      badgeId: badge.id,
    }),

    databaseBuilder.factory.buildSkillSet({
      name: 'Domaine Pix+ Droit Domaine 10',
      skillIds: targetProfileSkillIds[3].map((id) => id),
      badgeId: badge.id,
    }),
  );
}

function _associatePixDroitExpertSkillSets(databaseBuilder, targetProfileSkillIds, badge) {
  return _returnIds(
    databaseBuilder.factory.buildSkillSet({
      name: 'Acquis du référentiel Pix',
      skillIds: targetProfileSkillIds[0].map((id) => id),
      badgeId: badge.id,
    }),

    databaseBuilder.factory.buildSkillSet({
      name: 'Acquis Pix+ Droit',
      skillIds: targetProfileSkillIds[1].map((id) => id),
      badgeId: badge.id,
    }),

    databaseBuilder.factory.buildSkillSet({
      name: 'Domaine Pix+ Droit Domaine 7',
      skillIds: targetProfileSkillIds[2].map((id) => id),
      badgeId: badge.id,
    }),

    databaseBuilder.factory.buildSkillSet({
      name: 'Domaine Pix+ Droit Domaine 10',
      skillIds: targetProfileSkillIds[3].map((id) => id),
      badgeId: badge.id,
    }),
  );
}

function _associatePixDroitMasterBadgeCriteria(databaseBuilder, badge, skillSetsIds) {
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 70,
    badgeId: badge.id,
    skillSetIds: [skillSetsIds[0]],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 60,
    badgeId: badge.id,
    skillSetIds: [skillSetsIds[1]],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 40,
    badgeId: badge.id,
    skillSetIds: [skillSetsIds[2], skillSetsIds[3]],
  });
}

function _associatePixDroitExpertBadgeCriteria(databaseBuilder, badge, skillSetsIds) {
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 70,
    badgeId: badge.id,
    skillSetIds: [skillSetsIds[0]],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 80,
    badgeId: badge.id,
    skillSetIds: [skillSetsIds[1]],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 40,
    badgeId: badge.id,
    skillSetIds: [skillSetsIds[2], skillSetsIds[3]],
  });
}

function _associatePixEduFormationInitialeSkillSets(
  databaseBuilder,
  skillIdsForPixEduDomain1,
  skillIdsForPixEduDomain2,
  badge,
) {
  return _returnIds(
    databaseBuilder.factory.buildSkillSet({
      name: 'Domaine Pix+ Édu Domaine 1',
      skillIds: skillIdsForPixEduDomain1.map((id) => id),
      badgeId: badge.id,
    }),
    databaseBuilder.factory.buildSkillSet({
      name: 'Domaine Pix+ Édu Domaine 2',
      skillIds: skillIdsForPixEduDomain2.map((id) => id),
      badgeId: badge.id,
    }),
  );
}

function _associatePixEduFormationContinueSkillSets(databaseBuilder, skillIdsForPixEduDomain3, badge) {
  return _returnIds(
    databaseBuilder.factory.buildSkillSet({
      name: 'Domaine Pix+ Édu Domaine 3',
      skillIds: skillIdsForPixEduDomain3.map((id) => id),
      badgeId: badge.id,
    }),
  );
}

export default {
  badgesBuilder,
  PIX_EMPLOI_CLEA_BADGE_ID_V1,
  PIX_EMPLOI_CLEA_BADGE_ID_V2,
  PIX_EMPLOI_CLEA_BADGE_ID_V3,
  BASICS_BADGE_ID,
  TOOLS_BADGE_ID,
  MANIP_BADGE_ID,
  PRO_BASICS_BADGE_ID,
  PRO_TOOLS_BADGE_ID,
  PIX_DROIT_MAITRE_BADGE_ID,
  PIX_DROIT_EXPERT_BADGE_ID,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE_BADGE_ID,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE_BADGE_ID,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT_BADGE_ID,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT_BADGE_ID,
};
