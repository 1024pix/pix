module.exports = function pixEmploiTargetProfileBuilder({ databaseBuilder }) {

  const pixEmploiProfile = databaseBuilder.factory.buildTargetProfile({
    id: 100321,
    name: 'Pix emploi - Parcours complet',
    isPublic: true,
    organizationId: 1,
  });

  const targetProfileSkills = [
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'rectL2ZZeWPc7yezp' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recndXqXiv4pv2Ukp' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recMOy4S8XnaWblYI' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recagUd44RPEWti0X' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recrvTvLTUXEcUIV1' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recX7RyCsdNV2p168' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recxtb5aLs6OAAKIg' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'receRbbt9Lb661wFB' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'rec71e3PSct2zLEMj' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recFwJlpllhWzuLom' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'rec0J9OXaAj5v7w3r' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'reclY3njuk6EySJuU' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'rec5V9gp65a58nnco' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recPrXhP0X07OdHXe' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recPG9ftlGZLiF0O6' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'rectLj7NPg5JcSIqN' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'rec9qal2FLjWysrfu' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'rechRPFlSryfY3UnG' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recL0AotZshb9quhR' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recrOwaV2PTt1N0i5' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recpdpemRXuzV9r10' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recWXtN5cNP1JQUVx' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recTIddrkopID28Ep' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recBrDIfDDW2IPpZV' }),
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: pixEmploiProfile.id, skillId: 'recgOc2OreHCosoRp' }),
  ];

  const badge = databaseBuilder.factory.buildBadge({
    altMessage: 'Vous avez validé le badge Pix Emploi.',
    imageUrl: '/images/badges/Pix-emploi.svg',
    key: 'PIX_EMPLOI',
    message: 'Bravo ! Vous maîtrisez les compétences indispensables pour utiliser le numérique en milieu professionnel. ' +
      'Pour valoriser vos compétences avec une double certification Pix-CléA numérique, renseignez-vous auprès de votre conseiller ou de votre formateur.',
    targetProfileId: pixEmploiProfile.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name : 'Rechercher des informations sur internet',
    color : 'jaffa',
    skillIds : [
      targetProfileSkills[0].skillId,
      targetProfileSkills[1].skillId,
      targetProfileSkills[2].skillId,
      targetProfileSkills[3].skillId,
      targetProfileSkills[4].skillId,
      targetProfileSkills[5].skillId,
      targetProfileSkills[6].skillId,
      targetProfileSkills[7].skillId,
      targetProfileSkills[8].skillId,
      targetProfileSkills[9].skillId,
    ],
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name : 'Utiliser des outils informatiques',
    color : 'wild-strawberry',
    skillIds : [
      targetProfileSkills[10].skillId,
      targetProfileSkills[11].skillId,
      targetProfileSkills[12].skillId,
      targetProfileSkills[13].skillId,
      targetProfileSkills[14].skillId,
      targetProfileSkills[15].skillId,
    ],
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name : 'Naviguer sur internet',
    color : 'jaffa',
    skillIds : [
      targetProfileSkills[16].skillId,
      targetProfileSkills[17].skillId,
      targetProfileSkills[18].skillId,
      targetProfileSkills[19].skillId,
      targetProfileSkills[20].skillId,
      targetProfileSkills[21].skillId,
    ],
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name : 'Partager sur les réseaux sociaux',
    color : 'emerald',
    skillIds : [
      targetProfileSkills[22].skillId,
      targetProfileSkills[23].skillId,
      targetProfileSkills[24].skillId,
    ],
    badgeId: badge.id,
  });

};
