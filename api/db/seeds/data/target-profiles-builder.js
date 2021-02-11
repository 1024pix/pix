const { PRO_COMPANY_ID, PRO_POLE_EMPLOI_ID, PRO_MED_NUM_ID } = require('./organizations-pro-builder');
const { SUP_UNIVERSITY_ID } = require('./organizations-sup-builder');

const skillIdsForBadgePartnerCompetence1 = [
  'recMOy4S8XnaWblYI', 'recPG9ftlGZLiF0O6', 'recH1pcEWLBUCqXTm', 'recIDXphXbneOrbux', 'recclxUSbi0fvIWpd',
  'recLCYATl7TGrkZLh', 'rectL2ZZeWPc7yezp', 'recndXqXiv4pv2Ukp', 'recVv1eoSLW7yFgXv', 'recVywppdS4hGEekR',
  'recGd7oJ2wVEyKmPS', 'recDZTKszXX02aXD1', 'recFwJlpllhWzuLom', 'rec0J9OXaAj5v7w3r', 'recUvHMSCCrhtSWS6',
  'recdgeyLSVKUpyJF0', 'recAuRue2poqxgQG2', 'recX7RyCsdNV2p168', 'recxtb5aLs6OAAKIg', 'recfLjzQKBD8Umdcx',
  'recetgnhc67yFnWbl', 'recPrXhP0X07OdHXe', 'reclDKLSXIsr4xoZp', 'recmLZ0CypLpsxm96', 'rec2zofANqBsZdecI',
  'reckgdGuUyHtQvhRo', 'reclY3njuk6EySJuU', 'rec5V9gp65a58nnco', 'recKjdLuENEtJLx0f', 'recfSZlSomGI9PQjn',
  'recg4t3r8Cs7RPKXY', 'recDl1yX3l2SWb9ju', 'recZ6RUx2zcIaRAIC', 'recdwoJE9Po9zdf0A', 'receRbbt9Lb661wFB',
  'rec71e3PSct2zLEMj', 'recpyHTeNkGnFnqhZ', 'recHvlTH8v706UYvc', 'recagUd44RPEWti0X', 'recrvTvLTUXEcUIV1',
  'rec7QdcMIhYfmkgq9', 'recIkcTpbNZy9YetV', 'reciVlfNtTgkQJCHt', 'rec5LVAAMsUHYx5eD', 'recvMdYj3tPrMa79u',
  'recB1qZjFA0s2UsdU', 'recmMMVns3LEFkHeO', 'recfRe4luCCP8GoVA', 'reckyBHOf8yIl2UGq',
];

const skillIdsForBadgePartnerCompetence2 = [
  'recybd8jWDNiFpbgq', 'recL4pRDGJZhgxsEL', 'recMOxOdfesur8E7L', 'rectLj7NPg5JcSIqN', 'recL0AotZshb9quhR',
  'recrOwaV2PTt1N0i5', 'recyblYaLq5YHTSRk', 'rec9qal2FLjWysrfu', 'rechRPFlSryfY3UnG', 'reciVXqruKqnV4haA',
  'recbwejYcw1T1zA06', 'recJLroTYxcfbczfW', 'recuE3dO6Qjnfbu2y', 'recsPpUso9cY2u1I8', 'recH8iHKeJ5iws289',
  'rec9uQTL8ZFm1rSTY', 'recPgkHUdzk0HPGt1', 'reclX9KELFBQeVKoC', 'recBsT8BoStvZP6av',
];

const skillIdsForBadgePartnerCompetence3 = [
  'recZnnTU4WUP6KwwX', 'rececWx6MmPhufxXk', 'recAFoEonOOChXe9t', 'recaMBgjv3EZnAlWO', 'recXDYAkqqIDCDePc',
  'recwOLZ8bzMQK9NF9', 'recR1SlS7sWoquhoC', 'recPGDVdX0LSOWQQC', 'rec0tk8dZWOzSQbaQ', 'recmoanUlDOyXexPF',
  'recKbNbM8G7mKaloD', 'recEdU3ZJrHxWOLcb', 'recfktfO0ROu1OifX', 'rec7WOXWi5ClE8BxH', 'recHo6D1spbDR9C2N',
  'recpdpemRXuzV9r10', 'recWXtN5cNP1JQUVx', 'rec7EvARki1b9t574', 'rec6IWrDOSaoX4aLn', 'recI4zS51by3N7Ryi',
  'recrV8JAEsieJOAch', 'recHBMRraNImyqmDF', 'recaTPKUCD6uAS0li', 'recicaqEeoJUtXT6j', 'recDotNI5r7ApHfwa',
];

const skillIdsForBadgePartnerCompetence4 = [
  'recTIddrkopID28Ep', 'recBrDIfDDW2IPpZV', 'recixKw4lXIiHue01', 'recLYUZrWeizc4G5d', 'recgOc2OreHCosoRp',
  'recb0ZHKckwrnZeb8', 'recF9oTiR8fMSnQoo', 'recm2r3CA4crfigAk', 'recWjPO6uH6NqaiD4', 'rec0o0fVvpExTlZGp',
  'rec8Ot7GXqSJLn99A', 'recOYQhD9e6c3YkPu', 'recLXE4vlQ5vcGsLP', 'reco16sNopoBMdhnQ', 'recgs5q5APUX7kcRp',
  'recvo2KPsvK0fnIIN', 'reci70rsZPmL12z5b', 'recX6aP7OkjU9PVWE', 'recUdMS2pRSF4sgnk', 'recVgnoo6RjCxjCQp',
  'recLsem0KbElkpjvp', 'recSByLc0DNQ8F0D1', 'recEAJG3c7SNoiUcj', 'reclCMZpPDx3eQ46q', 'recQdr7rbPZ3Kh6Ef',
  'recLhYgOVFwOmQSLn', 'recfuk3QLAOzBQzSU', 'recXZWPaaJ6jlcmtq', 'rec2Kg1bqEZVI8fBh', 'recx7WnZJCXVgCvN4',
  'recAzV1ljhCdjrasn', 'rec9IR04aOpn5aSCP', 'recJGN6S3MmTZVa5O', 'recUCuU7EMEHAysmp', 'rec2DvazCDkBnqOmK',
];

const skillIdsForBadgePartnerCompetences = [
  skillIdsForBadgePartnerCompetence1,
  skillIdsForBadgePartnerCompetence2,
  skillIdsForBadgePartnerCompetence3,
  skillIdsForBadgePartnerCompetence4,
];

const TARGET_PROFILE_PIC_DIAG_INITIAL_ID = 1;
const TARGET_PROFILE_ONE_COMPETENCE_ID = 2;
const TARGET_PROFILE_STAGES_BADGES_ID = 3;
const TARGET_PROFILE_SIMPLIFIED_ACCESS_ID = 4;
const TARGET_PROFILE_PIX_EMPLOI_CLEA_ID = 5;

function targetProfilesBuilder({ databaseBuilder }) {
  _buildTargetProfilePICDiagnosticInitial(databaseBuilder);
  _buildTargetProfileOnCompetence(databaseBuilder);
  _buildTargetProfileWithStagesAndBadges(databaseBuilder);
  _buildTargetProfileWithSimplifiedAccess(databaseBuilder);
  _buildTargetProfilePixEmploiClea(databaseBuilder);
}

function _buildTargetProfilePICDiagnosticInitial(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    name: 'PIC - Diagnostic Initial',
    isPublic: false,
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

  [ 'rectL2ZZeWPc7yezp', 'recndXqXiv4pv2Ukp', 'recMOy4S8XnaWblYI', 'recagUd44RPEWti0X', 'recrvTvLTUXEcUIV1',
    'recX7RyCsdNV2p168', 'recxtb5aLs6OAAKIg', 'receRbbt9Lb661wFB', 'rec71e3PSct2zLEMj', 'recFwJlpllhWzuLom',
    'rec0J9OXaAj5v7w3r', 'reclY3njuk6EySJuU', 'rec5V9gp65a58nnco', 'recPrXhP0X07OdHXe', 'recPG9ftlGZLiF0O6',
    'rectLj7NPg5JcSIqN', 'rec9qal2FLjWysrfu', 'rechRPFlSryfY3UnG', 'recL0AotZshb9quhR', 'recrOwaV2PTt1N0i5',
    'recpdpemRXuzV9r10', 'recWXtN5cNP1JQUVx', 'recTIddrkopID28Ep', 'recBrDIfDDW2IPpZV', 'recgOc2OreHCosoRp',
  ].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID, skillId });
  });
}

function _buildTargetProfileOnCompetence(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_ONE_COMPETENCE_ID,
    name: 'Résoudre des problèmes techniques (compétence 5.1)',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/profil-cible/Illu_classe2.svg',
    isPublic: false,
    ownerOrganizationId: PRO_COMPANY_ID,
  });

  [
    'recGd7oJ2wVEyKmPS', 'recHvlTH8v706UYvc', 'recl2o6fA6oyMGPkb', 'recVgnoo6RjCxjCQp', 'recUQEnFmSvPBA807',
    'recINVk1gM5DHCbs7', 'recpyHTeNkGnFnqhZ', 'rec9iiMaoi1GLzWVn', 'rec336WB21z6wKR6q', 'recVywppdS4hGEekR',
    'recIcL3GuLDaDgGAt', 'recOyQOjUhDKTO7UN', 'recO6p9wxUDweUysu', 'recrxbonOSuEvsuor', 'recDZTKszXX02aXD1',
    'rec8b2zEqznu1VdSu', 'rectZKS13rdkqxHer', 'recW4iZCujkyyfCve', 'recxij74P8pBL3pdq', 'recmB2623CruGvA1b',
    'recIOtIleMBECQayX', 'recEPgGwP6P3nZBbK', 'recbZ44oYHqlOGJ2C', 'recU78yTsZnxIghHA', 'recDkqabsU2X5a4Z5',
    'recVv1eoSLW7yFgXv', 'recvBiIG0dvHJOe7i', 'reca2TivtMI9QRWBY', 'recSF5OuzyBOfg97L', 'recUdMS2pRSF4sgnk',
    'recr9No0p5zGhq2bg', 'recWalmeLbapvhX3K', 'recKTybfk95zVWBDM', 'recKFUQ2CzcYHrxPR',
  ].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: TARGET_PROFILE_ONE_COMPETENCE_ID, skillId });
  });
}

function _buildTargetProfileWithStagesAndBadges(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_STAGES_BADGES_ID,
    name: 'Parcours avec paliers & résultats thématiques',
    isPublic: true,
    ownerOrganizationId: null,
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/profil-cible/Illu_classe2.svg',
  });

  [ 'rectL2ZZeWPc7yezp', 'recndXqXiv4pv2Ukp', 'recMOy4S8XnaWblYI', 'recagUd44RPEWti0X', 'recrvTvLTUXEcUIV1',
    'recX7RyCsdNV2p168', 'recxtb5aLs6OAAKIg', 'receRbbt9Lb661wFB', 'rec71e3PSct2zLEMj', 'recFwJlpllhWzuLom',
    'rec0J9OXaAj5v7w3r', 'reclY3njuk6EySJuU', 'rec5V9gp65a58nnco', 'recPrXhP0X07OdHXe', 'recPG9ftlGZLiF0O6',
    'rectLj7NPg5JcSIqN', 'rec9qal2FLjWysrfu', 'rechRPFlSryfY3UnG', 'recL0AotZshb9quhR', 'recrOwaV2PTt1N0i5',
    'recpdpemRXuzV9r10', 'recWXtN5cNP1JQUVx', 'recTIddrkopID28Ep', 'recBrDIfDDW2IPpZV', 'recgOc2OreHCosoRp',
  ].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID, skillId });
  });
}

function _buildTargetProfileWithSimplifiedAccess(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_SIMPLIFIED_ACCESS_ID,
    name: 'Accès simplifié',
    isPublic: true,
    ownerOrganizationId: PRO_MED_NUM_ID,
    isSimplifiedAccess: true,
  });

  ['recFwJlpllhWzuLom', 'rec0J9OXaAj5v7w3r', 'reclY3njuk6EySJuU', 'rec5V9gp65a58nnco', 'recPrXhP0X07OdHXe',
    'recPG9ftlGZLiF0O6', 'rectLj7NPg5JcSIqN', 'rec9qal2FLjWysrfu', 'rechRPFlSryfY3UnG', 'recL0AotZshb9quhR',
  ].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: TARGET_PROFILE_SIMPLIFIED_ACCESS_ID, skillId });
  });
}

function _buildTargetProfilePixEmploiClea(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
    name: 'Pix emploi - Parcours complet',
    isPublic: false,
    ownerOrganizationId: PRO_POLE_EMPLOI_ID,
  });

  [...skillIdsForBadgePartnerCompetence1,
    ...skillIdsForBadgePartnerCompetence2,
    ...skillIdsForBadgePartnerCompetence3,
    ...skillIdsForBadgePartnerCompetence4,
  ].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID, skillId });
  });
}

module.exports = {
  targetProfilesBuilder,
  TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
  TARGET_PROFILE_ONE_COMPETENCE_ID,
  TARGET_PROFILE_STAGES_BADGES_ID,
  TARGET_PROFILE_SIMPLIFIED_ACCESS_ID,
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
  skillIdsForBadgePartnerCompetences,
};
