import { PRO_COMPANY_ID, PRO_POLE_EMPLOI_ID, PRO_MED_NUM_ID } from './organizations-pro-builder';
import identity from 'lodash/identity';
import { SUP_UNIVERSITY_ID } from './organizations-sup-builder';

const skillIdsForSkillSet1 = [
  'recMOy4S8XnaWblYI',
  'recPG9ftlGZLiF0O6',
  'recH1pcEWLBUCqXTm',
  'recIDXphXbneOrbux',
  'rectL2ZZeWPc7yezp',
  'recndXqXiv4pv2Ukp',
  'recVv1eoSLW7yFgXv',
  'recVywppdS4hGEekR',
  'recGd7oJ2wVEyKmPS',
  'recDZTKszXX02aXD1',
  'recFwJlpllhWzuLom',
  'rec0J9OXaAj5v7w3r',
  'recUvHMSCCrhtSWS6',
  'recdgeyLSVKUpyJF0',
  'recAuRue2poqxgQG2',
  'recX7RyCsdNV2p168',
  'recxtb5aLs6OAAKIg',
  'recPrXhP0X07OdHXe',
  'reclDKLSXIsr4xoZp',
  'recmLZ0CypLpsxm96',
  'rec2zofANqBsZdecI',
  'reckgdGuUyHtQvhRo',
  'reclY3njuk6EySJuU',
  'rec5V9gp65a58nnco',
  'recKjdLuENEtJLx0f',
  'recfSZlSomGI9PQjn',
  'recg4t3r8Cs7RPKXY',
  'recDl1yX3l2SWb9ju',
  'recZ6RUx2zcIaRAIC',
  'recdwoJE9Po9zdf0A',
  'receRbbt9Lb661wFB',
  'rec71e3PSct2zLEMj',
  'recpyHTeNkGnFnqhZ',
  'recHvlTH8v706UYvc',
  'recagUd44RPEWti0X',
  'recrvTvLTUXEcUIV1',
  'rec7QdcMIhYfmkgq9',
  'recIkcTpbNZy9YetV',
  'reciVlfNtTgkQJCHt',
  'rec5LVAAMsUHYx5eD',
  'recvMdYj3tPrMa79u',
  'recB1qZjFA0s2UsdU',
  'recmMMVns3LEFkHeO',
  'recfRe4luCCP8GoVA',
  'reckyBHOf8yIl2UGq',
];

const skillIdsForSkillSet2 = [
  'recybd8jWDNiFpbgq',
  'recL4pRDGJZhgxsEL',
  'recMOxOdfesur8E7L',
  'rectLj7NPg5JcSIqN',
  'recL0AotZshb9quhR',
  'recrOwaV2PTt1N0i5',
  'recyblYaLq5YHTSRk',
  'rec9qal2FLjWysrfu',
  'rechRPFlSryfY3UnG',
  'reciVXqruKqnV4haA',
  'recbwejYcw1T1zA06',
  'recJLroTYxcfbczfW',
  'recuE3dO6Qjnfbu2y',
  'recsPpUso9cY2u1I8',
  'recH8iHKeJ5iws289',
  'rec9uQTL8ZFm1rSTY',
  'recPgkHUdzk0HPGt1',
  'reclX9KELFBQeVKoC',
  'recBsT8BoStvZP6av',
];

const skillIdsForSkillSet3 = [
  'rececWx6MmPhufxXk',
  'recAFoEonOOChXe9t',
  'recaMBgjv3EZnAlWO',
  'recXDYAkqqIDCDePc',
  'recwOLZ8bzMQK9NF9',
  'recR1SlS7sWoquhoC',
  'recPGDVdX0LSOWQQC',
  'rec0tk8dZWOzSQbaQ',
  'recmoanUlDOyXexPF',
  'recKbNbM8G7mKaloD',
  'recfktfO0ROu1OifX',
  'rec7WOXWi5ClE8BxH',
  'recWXtN5cNP1JQUVx',
  'rec7EvARki1b9t574',
  'recI4zS51by3N7Ryi',
  'recrV8JAEsieJOAch',
  'recaTPKUCD6uAS0li',
  'recicaqEeoJUtXT6j',
];
const skillIdsForSkillSet3_V1_only = ['rec6IWrDOSaoX4aLn', 'recZnnTU4WUP6KwwX'];
const skillIdsForSkillSet3_V2_only = ['recqSPZiRJYzfCDaS', 'recRAXPXVL2cMh5b5'];
const skillIdsForSkillSet3_V3_only = ['recqSPZiRJYzfCDaS', 'recRAXPXVL2cMh5b5'];

const skillIdsForSkillSet4 = [
  'recTIddrkopID28Ep',
  'recBrDIfDDW2IPpZV',
  'recixKw4lXIiHue01',
  'recgOc2OreHCosoRp',
  'recb0ZHKckwrnZeb8',
  'recF9oTiR8fMSnQoo',
  'recm2r3CA4crfigAk',
  'recWjPO6uH6NqaiD4',
  'rec0o0fVvpExTlZGp',
  'rec8Ot7GXqSJLn99A',
  'recOYQhD9e6c3YkPu',
  'recLXE4vlQ5vcGsLP',
  'reco16sNopoBMdhnQ',
  'recgs5q5APUX7kcRp',
  'recvo2KPsvK0fnIIN',
  'reci70rsZPmL12z5b',
  'recX6aP7OkjU9PVWE',
  'recUdMS2pRSF4sgnk',
  'recVgnoo6RjCxjCQp',
  'recLsem0KbElkpjvp',
  'recEAJG3c7SNoiUcj',
  'recQdr7rbPZ3Kh6Ef',
  'recLhYgOVFwOmQSLn',
  'recfuk3QLAOzBQzSU',
];
const skillIdsForSkillSet4_V1_only = ['recAzV1ljhCdjrasn', 'recx7WnZJCXVgCvN4'];
const skillIdsForSkillSet4_V2_only = ['rec1XTXVEkhBVKPLW'];
const skillIdsForSkillSet4_V3_only = ['rec1XTXVEkhBVKPLW'];

const targetProfileSkillIdsForCleaBadgeV1 = [
  skillIdsForSkillSet1,
  skillIdsForSkillSet2,
  skillIdsForSkillSet3,
  skillIdsForSkillSet3_V1_only,
  skillIdsForSkillSet4,
  skillIdsForSkillSet4_V1_only,
];

const targetProfileSkillIdsForCleaBadgeV2 = [
  skillIdsForSkillSet1,
  skillIdsForSkillSet2,
  skillIdsForSkillSet3,
  skillIdsForSkillSet3_V2_only,
  skillIdsForSkillSet4,
  skillIdsForSkillSet4_V2_only,
];

const targetProfileSkillIdsForCleaBadgeV3 = [
  skillIdsForSkillSet1,
  skillIdsForSkillSet2,
  skillIdsForSkillSet3,
  skillIdsForSkillSet3_V3_only,
  skillIdsForSkillSet4,
  skillIdsForSkillSet4_V3_only,
];
const TARGET_PROFILE_PIC_DIAG_INITIAL_ID = 1;
const TARGET_PROFILE_ONE_COMPETENCE_ID = 2;
const TARGET_PROFILE_STAGES_BADGES_ID = 3;
const TARGET_PROFILE_SIMPLIFIED_ACCESS_ID = 4;
const TARGET_PROFILE_PIX_EMPLOI_CLEA_ID = 5;
const TARGET_PROFILE_PIX_DROIT_ID = 6;
const TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V2 = 7;
const TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE = 8;
const TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE = 9;
const TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_1ER_DEGRE = 10;
const TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE = 11;
const TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V3 = 12;
const TARGET_PROFILE_CNAV_ID = 13;
const TARGET_PROFILE_STAGES_LEVEL_ID = 14;

function targetProfilesBuilder({ databaseBuilder }) {
  _buildTargetProfilePICDiagnosticInitial(databaseBuilder);
  _buildTargetProfileOneCompetence(databaseBuilder);
  _buildTargetProfileWithStagesAndBadges(databaseBuilder);
  _buildTargetProfileWithStagesLevel(databaseBuilder);
  _buildTargetProfileWithSimplifiedAccess(databaseBuilder);
  _buildTargetProfilePixEmploiCleaV1(databaseBuilder);
  _buildTargetProfilePixEmploiCleaV2(databaseBuilder);
  _buildTargetProfilePixEmploiCleaV3(databaseBuilder);
  _buildTargetProfilePixDroit(databaseBuilder);
  _buildTargetProfilePixEduFormationInitiale2ndDegre(databaseBuilder);
  _buildTargetProfilePixEduFormationInitiale1erDegre(databaseBuilder);
  _buildTargetProfilePixEduFormationContinue2ndDegre(databaseBuilder);
  _buildTargetProfilePixEduFormationContinue1erDegre(databaseBuilder);
  _buildTargetProfileCnav(databaseBuilder);
}

function _buildTargetProfilePICDiagnosticInitial(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    name: 'PIC - Diagnostic Initial',
    isPublic: false,
    category: 'OTHER',
    ownerOrganizationId: PRO_MED_NUM_ID,
  });

  databaseBuilder.factory.buildTargetProfileShare({
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    organizationId: PRO_COMPANY_ID,
  });
  databaseBuilder.factory.buildTargetProfileShare({
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    organizationId: SUP_UNIVERSITY_ID,
  });

  [
    'rectL2ZZeWPc7yezp',
    'recndXqXiv4pv2Ukp',
    'recMOy4S8XnaWblYI',
    'recagUd44RPEWti0X',
    'recrvTvLTUXEcUIV1',
    'recX7RyCsdNV2p168',
    'recxtb5aLs6OAAKIg',
    'rec71e3PSct2zLEMj',
    'recFwJlpllhWzuLom',
    'rec0J9OXaAj5v7w3r',
    'reclY3njuk6EySJuU',
    'rec5V9gp65a58nnco',
    'recPrXhP0X07OdHXe',
    'recPG9ftlGZLiF0O6',
    'rectLj7NPg5JcSIqN',
    'rec9qal2FLjWysrfu',
    'rechRPFlSryfY3UnG',
    'recL0AotZshb9quhR',
    'recrOwaV2PTt1N0i5',
    'recpdpemRXuzV9r10',
    'recWXtN5cNP1JQUVx',
    'recTIddrkopID28Ep',
    'recBrDIfDDW2IPpZV',
    'recgOc2OreHCosoRp',
    'recGd7oJ2wVEyKmPS',
    'recVv1eoSLW7yFgXv',
    'recVywppdS4hGEekR',
    'recOyQOjUhDKTO7UN',
    'recKFUQ2CzcYHrxPR',
    'recmB2623CruGvA1b',
  ].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID, skillId });
  });
}

function _buildTargetProfileOneCompetence(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_ONE_COMPETENCE_ID,
    name: 'Résoudre des problèmes techniques (compétence 5.1)',
    imageUrl: 'https://images.pix.fr/profil-cible/Illu_classe2.svg',
    isPublic: false,
    category: 'COMPETENCES',
    ownerOrganizationId: PRO_COMPANY_ID,
    description:
      'Ce profil cible permet d\'**évaluer** sur la compétence 5.1. Le résultat est exprimé en ***pourcentage***',
    comment: 'Privé : Contient la ***compétence 5.1***.',
  });

  [
    'recGd7oJ2wVEyKmPS',
    'recHvlTH8v706UYvc',
    'recl2o6fA6oyMGPkb',
    'recVgnoo6RjCxjCQp',
    'recUQEnFmSvPBA807',
    'recINVk1gM5DHCbs7',
    'recpyHTeNkGnFnqhZ',
    'rec9iiMaoi1GLzWVn',
    'rec336WB21z6wKR6q',
    'recVywppdS4hGEekR',
    'recIcL3GuLDaDgGAt',
    'recOyQOjUhDKTO7UN',
    'recO6p9wxUDweUysu',
    'recrxbonOSuEvsuor',
    'recDZTKszXX02aXD1',
    'rec8b2zEqznu1VdSu',
    'rectZKS13rdkqxHer',
    'recW4iZCujkyyfCve',
    'recxij74P8pBL3pdq',
    'recmB2623CruGvA1b',
    'recIOtIleMBECQayX',
    'recEPgGwP6P3nZBbK',
    'recbZ44oYHqlOGJ2C',
    'recU78yTsZnxIghHA',
    'recDkqabsU2X5a4Z5',
    'recVv1eoSLW7yFgXv',
    'recvBiIG0dvHJOe7i',
    'reca2TivtMI9QRWBY',
    'recSF5OuzyBOfg97L',
    'recUdMS2pRSF4sgnk',
    'recr9No0p5zGhq2bg',
    'recWalmeLbapvhX3K',
    'recKTybfk95zVWBDM',
    'recKFUQ2CzcYHrxPR',
  ].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: TARGET_PROFILE_ONE_COMPETENCE_ID, skillId });
  });
}

function _buildTargetProfileWithStagesAndBadges(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_STAGES_BADGES_ID,
    name: 'Parcours avec paliers & résultats thématiques',
    isPublic: true,
    category: 'COMPETENCES',
    ownerOrganizationId: null,
    imageUrl: 'https://images.pix.fr/profil-cible/Illu_classe2.svg',
  });

  [
    'rectL2ZZeWPc7yezp',
    'recndXqXiv4pv2Ukp',
    'recMOy4S8XnaWblYI',
    'recagUd44RPEWti0X',
    'recrvTvLTUXEcUIV1',
    'recX7RyCsdNV2p168',
    'recxtb5aLs6OAAKIg',
    'receRbbt9Lb661wFB',
    'rec71e3PSct2zLEMj',
    'recFwJlpllhWzuLom',
    'rec0J9OXaAj5v7w3r',
    'reclY3njuk6EySJuU',
    'rec5V9gp65a58nnco',
    'recPrXhP0X07OdHXe',
    'recPG9ftlGZLiF0O6',
    'rectLj7NPg5JcSIqN',
    'rec9qal2FLjWysrfu',
    'rechRPFlSryfY3UnG',
    'recL0AotZshb9quhR',
    'recrOwaV2PTt1N0i5',
    'recpdpemRXuzV9r10',
    'recWXtN5cNP1JQUVx',
    'recTIddrkopID28Ep',
    'recBrDIfDDW2IPpZV',
    'recgOc2OreHCosoRp',
    'recGd7oJ2wVEyKmPS',
    'recVv1eoSLW7yFgXv',
    'recVywppdS4hGEekR',
    'recOyQOjUhDKTO7UN',
    'recKFUQ2CzcYHrxPR',
    'recmB2623CruGvA1b',
  ].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID, skillId });
  });
}

function _buildTargetProfileWithStagesLevel(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_STAGES_LEVEL_ID,
    name: 'Parcours avec paliers par niveau',
    isPublic: true,
    category: 'COMPETENCES',
    ownerOrganizationId: null,
    imageUrl: 'https://images.pix.fr/profil-cible/Illu_classe2.svg',
  });

  [
    'rectL2ZZeWPc7yezp',
    'recndXqXiv4pv2Ukp',
    'recMOy4S8XnaWblYI',
    'recagUd44RPEWti0X',
    'recrvTvLTUXEcUIV1',
    'recX7RyCsdNV2p168',
    'recxtb5aLs6OAAKIg',
    'receRbbt9Lb661wFB',
    'rec71e3PSct2zLEMj',
    'recFwJlpllhWzuLom',
    'rec0J9OXaAj5v7w3r',
    'reclY3njuk6EySJuU',
    'rec5V9gp65a58nnco',
    'recPrXhP0X07OdHXe',
    'recPG9ftlGZLiF0O6',
    'rectLj7NPg5JcSIqN',
    'rec9qal2FLjWysrfu',
    'rechRPFlSryfY3UnG',
    'recL0AotZshb9quhR',
    'recrOwaV2PTt1N0i5',
    'recpdpemRXuzV9r10',
    'recWXtN5cNP1JQUVx',
    'recTIddrkopID28Ep',
    'recBrDIfDDW2IPpZV',
    'recgOc2OreHCosoRp',
    'recGd7oJ2wVEyKmPS',
    'recVv1eoSLW7yFgXv',
    'recVywppdS4hGEekR',
    'recOyQOjUhDKTO7UN',
    'recKFUQ2CzcYHrxPR',
    'recmB2623CruGvA1b',
  ].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: TARGET_PROFILE_STAGES_LEVEL_ID, skillId });
  });
}

function _buildTargetProfileWithSimplifiedAccess(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_SIMPLIFIED_ACCESS_ID,
    name: 'Accès simplifié',
    isPublic: true,
    category: 'SUBJECT',
    ownerOrganizationId: PRO_MED_NUM_ID,
    isSimplifiedAccess: true,
  });

  [
    'recFwJlpllhWzuLom',
    'rec0J9OXaAj5v7w3r',
    'reclY3njuk6EySJuU',
    'rec5V9gp65a58nnco',
    'recPrXhP0X07OdHXe',
    'recPG9ftlGZLiF0O6',
    'rectLj7NPg5JcSIqN',
    'rec9qal2FLjWysrfu',
    'rechRPFlSryfY3UnG',
    'recL0AotZshb9quhR',
  ].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: TARGET_PROFILE_SIMPLIFIED_ACCESS_ID, skillId });
  });
}

function _buildTargetProfilePixEmploiClea({ databaseBuilder, id, name, targetProfileSkillIdsForCleaBadge }) {
  databaseBuilder.factory.buildTargetProfile({
    id,
    name,
    isPublic: false,
    category: 'CUSTOM',
    ownerOrganizationId: PRO_POLE_EMPLOI_ID,
  });

  targetProfileSkillIdsForCleaBadge.flatMap(identity).forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: id, skillId });
  });
}
function _buildTargetProfilePixEmploiCleaV1(databaseBuilder) {
  return _buildTargetProfilePixEmploiClea({
    databaseBuilder,
    id: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
    name: 'Pix emploi - Parcours complet',
    targetProfileSkillIdsForCleaBadge: targetProfileSkillIdsForCleaBadgeV1,
  });
}

function _buildTargetProfilePixEmploiCleaV2(databaseBuilder) {
  return _buildTargetProfilePixEmploiClea({
    databaseBuilder,
    id: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V2,
    name: 'Parcours complet CléA numérique (2021)',
    targetProfileSkillIdsForCleaBadge: targetProfileSkillIdsForCleaBadgeV2,
  });
}

function _buildTargetProfilePixEmploiCleaV3(databaseBuilder) {
  return _buildTargetProfilePixEmploiClea({
    databaseBuilder,
    id: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V3,
    name: 'Parcours complet CléA numérique (2022)',
    targetProfileSkillIdsForCleaBadge: targetProfileSkillIdsForCleaBadgeV3,
  });
}

function _buildTargetProfilePixDroit(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_PIX_DROIT_ID,
    name: 'Pix+ Droit - Parcours complet',
    isPublic: false,
    category: 'SUBJECT',
    ownerOrganizationId: PRO_POLE_EMPLOI_ID,
  });

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

  [...skillIdsForPix, ...skillIdsForPixDroit].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: TARGET_PROFILE_PIX_DROIT_ID, skillId });
  });
}

function _buildTargetProfilePixEduFormationInitiale2ndDegre(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
    name: 'Pix+ Édu - Formation Initiale 2nd degré',
    isPublic: false,
    category: 'SUBJECT',
    ownerOrganizationId: PRO_POLE_EMPLOI_ID,
  });

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

  [...skillIdsForPixEduDomain1, ...skillIdsForPixEduDomain2].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({
      targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
      skillId,
    });
  });
}

function _buildTargetProfilePixEduFormationInitiale1erDegre(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_1ER_DEGRE,
    name: 'Pix+ Édu - Formation Initiale 1er degré',
    isPublic: false,
    category: 'SUBJECT',
    ownerOrganizationId: PRO_POLE_EMPLOI_ID,
  });

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

  [...skillIdsForPixEduDomain1, ...skillIdsForPixEduDomain2].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({
      targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_1ER_DEGRE,
      skillId,
    });
  });
}

function _buildTargetProfilePixEduFormationContinue2ndDegre(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE,
    name: 'Pix+ Édu - Formation Continue 2nd degré',
    isPublic: false,
    category: 'DISCIPLINE',
    ownerOrganizationId: PRO_POLE_EMPLOI_ID,
  });

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

  skillIdsForPixEduDomain3.forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({
      targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE,
      skillId,
    });
  });
}

function _buildTargetProfilePixEduFormationContinue1erDegre(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE,
    name: 'Pix+ Édu - Formation Continue 1er degré',
    isPublic: false,
    category: 'DISCIPLINE',
    ownerOrganizationId: PRO_POLE_EMPLOI_ID,
  });

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

  skillIdsForPixEduDomain3.forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({
      targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE,
      skillId,
    });
  });
}

function _buildTargetProfileCnav(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_CNAV_ID,
    name: 'Parcours Cnav',
    isPublic: false,
  });

  ['recAzV1ljhCdjrasn', 'recx7WnZJCXVgCvN4'].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: TARGET_PROFILE_CNAV_ID, skillId });
  });
}

export default {
  targetProfilesBuilder,
  TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
  TARGET_PROFILE_ONE_COMPETENCE_ID,
  TARGET_PROFILE_STAGES_BADGES_ID,
  TARGET_PROFILE_STAGES_LEVEL_ID,
  TARGET_PROFILE_SIMPLIFIED_ACCESS_ID,
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V2,
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V3,
  TARGET_PROFILE_PIX_DROIT_ID,
  TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
  TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE,
  TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_1ER_DEGRE,
  TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE,
  TARGET_PROFILE_CNAV_ID,
  targetProfileSkillIdsForCleaBadgeV1,
  targetProfileSkillIdsForCleaBadgeV2,
  targetProfileSkillIdsForCleaBadgeV3,
};
