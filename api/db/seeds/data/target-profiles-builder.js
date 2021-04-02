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
const TARGET_PROFILE_PIX_DROIT_ID = 6;

function targetProfilesBuilder({ databaseBuilder }) {
  _buildTargetProfilePICDiagnosticInitial(databaseBuilder);
  _buildTargetProfileOnCompetence(databaseBuilder);
  _buildTargetProfileWithStagesAndBadges(databaseBuilder);
  _buildTargetProfileWithSimplifiedAccess(databaseBuilder);
  _buildTargetProfilePixEmploiClea(databaseBuilder);
  _buildTargetProfilePixDroit(databaseBuilder);
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

function _buildTargetProfilePixDroit(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: TARGET_PROFILE_PIX_DROIT_ID,
    name: 'Pix+ Droit - Parcours complet',
    isPublic: false,
    ownerOrganizationId: PRO_POLE_EMPLOI_ID,
  });

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

  [...skillIdsForPix,
    ...skillIdsForPixDroit,
  ].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: TARGET_PROFILE_PIX_DROIT_ID, skillId });
  });
}

module.exports = {
  targetProfilesBuilder,
  TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
  TARGET_PROFILE_ONE_COMPETENCE_ID,
  TARGET_PROFILE_STAGES_BADGES_ID,
  TARGET_PROFILE_SIMPLIFIED_ACCESS_ID,
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
  TARGET_PROFILE_PIX_DROIT_ID,
  skillIdsForBadgePartnerCompetences,
};
