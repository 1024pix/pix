module.exports = function targetProfilesBuilder({ databaseBuilder }) {
  const targetProfile = databaseBuilder.factory.buildTargetProfile({
    id: 1,
    name: 'PIC - Diagnostic Initial',
    isPublic: false,
    organizationId: 5,
  });

  databaseBuilder.factory.buildTargetProfileShare({
    targetProfileId: targetProfile.id,
    organizationId: 1,
  });
  databaseBuilder.factory.buildTargetProfileShare({
    targetProfileId: targetProfile.id,
    organizationId: 2,
  });

  [ 'rectL2ZZeWPc7yezp',
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
  ].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({
      targetProfileId: targetProfile.id,
      skillId,
    });
  });

  const privateTargetProfile = databaseBuilder.factory.buildTargetProfile({
    id: 2,
    name: 'Résoudre des problèmes techniques (compétence 5.1)',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/profil-cible/Illu_classe2.svg',
    isPublic: false,
    organizationId: 1,
  });

  [
    'recGd7oJ2wVEyKmPS', 'recHvlTH8v706UYvc', 'recl2o6fA6oyMGPkb', 'recVgnoo6RjCxjCQp', 'recUQEnFmSvPBA807',
    'recINVk1gM5DHCbs7', 'recpyHTeNkGnFnqhZ', 'rec9iiMaoi1GLzWVn', 'rec336WB21z6wKR6q', 'recVywppdS4hGEekR',
    'recIcL3GuLDaDgGAt', 'recOyQOjUhDKTO7UN', 'recO6p9wxUDweUysu', 'recrxbonOSuEvsuor', 'recDZTKszXX02aXD1',
    'rec8b2zEqznu1VdSu', 'rectZKS13rdkqxHer', 'recW4iZCujkyyfCve', 'recxij74P8pBL3pdq', 'recmB2623CruGvA1b',
    'recIOtIleMBECQayX', 'recEPgGwP6P3nZBbK', 'recbZ44oYHqlOGJ2C', 'recU78yTsZnxIghHA', 'recDkqabsU2X5a4Z5',
    'recVv1eoSLW7yFgXv', 'recvBiIG0dvHJOe7i', 'reca2TivtMI9QRWBY', 'recSF5OuzyBOfg97L', 'recUdMS2pRSF4sgnk',
    'recr9No0p5zGhq2bg', 'recWalmeLbapvhX3K', 'recKTybfk95zVWBDM', 'recKFUQ2CzcYHrxPR',
  ]
    .forEach((skillId) => {
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: privateTargetProfile.id, skillId });
    });

  const badgeTargetProfile = databaseBuilder.factory.buildTargetProfile({
    id: 984165,
    name: 'Badges - Parcours Test',
    isPublic: true,
    organizationId: null,
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/profil-cible/Illu_classe2.svg',
  });

  [ 'rectL2ZZeWPc7yezp',
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
  ].forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({
      targetProfileId: badgeTargetProfile.id,
      skillId,
    });
  });
};
