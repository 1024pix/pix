module.exports = function cleaTargetProfileBuilder({ databaseBuilder }) {
  const outilsRS1 = 'recL0AotZshb9quhR';
  const miseEnFormeTexte1 = 'recmLZ0CypLpsxm96';
  const tri1 = 'recmMMVns3LEFkHeO';
  const propVideoSon1 = 'recqLmaAKc8EMmzi5';
  const langBalise1 = 'recRIm4iNiaz6epT5';
  const miseEnPageTxt1 = 'recRJyPT0FBEeVkzR';
  const serviceAdministratif1 = 'recTA33N3854qhjEx';
  const accesDonnées1 = 'recTIddrkopID28Ep';
  const Moteur1 = 'rectLj7NPg5JcSIqN';
  const environnementTravail1 = 'recX7RyCsdNV2p168';

  const cleaProfile = databaseBuilder.factory.buildTargetProfile({
    id: 100322,
    name: 'Cléa - Parcours complet',
    isPublic: true,
    organizationId: 1,
  });

  databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: cleaProfile.id, skillId: outilsRS1 });
  databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: cleaProfile.id, skillId: miseEnFormeTexte1 });
  databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: cleaProfile.id, skillId: tri1 });
  databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: cleaProfile.id, skillId: propVideoSon1 });
  databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: cleaProfile.id, skillId: propVideoSon1 });
  databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: cleaProfile.id, skillId: langBalise1 });
  databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: cleaProfile.id, skillId: miseEnPageTxt1 });
  databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: cleaProfile.id, skillId: serviceAdministratif1 });
  databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: cleaProfile.id, skillId: accesDonnées1 });
  databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: cleaProfile.id, skillId: Moteur1 });
  databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: cleaProfile.id, skillId: environnementTravail1 });

  const badge = databaseBuilder.factory.buildBadge({
    altMessage: 'Vous avez validé le badge Cléa numérique.',
    imageUrl: '/images/badges/Pret-CleaNum.svg',
    key: 'CLEA',
    message: 'Bravo ! Vous maîtrisez les compétences indispensables pour utiliser le numérique en milieu professionnel. ' +
      'Pour valoriser vos compétences, renseignez-vous auprès de votre conseiller.',
    targetProfileId: cleaProfile.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name: 'Rechercher des informations sur internet',
    color: 'jaffa',
    skillIds: [
      outilsRS1,
    ],
    badgeId: badge.id,
  });
};
