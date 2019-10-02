module.exports = function targetProfilesBuilder({ databaseBuilder }) {
  const targetProfileId = databaseBuilder.factory.buildTargetProfile({
    id:1,
    name: 'PIC - Diagnostic Initial',
    isPublic: true,
    organizationId: null,
  }).id;
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
      targetProfileId,
      skillId,
    });
  });
};
