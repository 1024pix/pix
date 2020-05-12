const BADGE_PIX_EMPLOI_ID = 100;
const Badge = require('../../../lib/domain/models/Badge');

function pixEmploiTargetProfileBuilder({ databaseBuilder }) {

  const pixEmploiProfile = databaseBuilder.factory.buildTargetProfile({
    id: 100321,
    name: 'Pix emploi - Parcours complet',
    isPublic: true,
    organizationId: 1,
  });

  const buildBadgePartnerCompetence1Skills = [databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recMOy4S8XnaWblYI'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recPG9ftlGZLiF0O6'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recH1pcEWLBUCqXTm'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recIDXphXbneOrbux'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recclxUSbi0fvIWpd'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recLCYATl7TGrkZLh'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rectL2ZZeWPc7yezp'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recndXqXiv4pv2Ukp'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recVv1eoSLW7yFgXv'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recVywppdS4hGEekR'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recGd7oJ2wVEyKmPS'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recDZTKszXX02aXD1'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recFwJlpllhWzuLom'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec0J9OXaAj5v7w3r'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recUvHMSCCrhtSWS6'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recdgeyLSVKUpyJF0'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recAuRue2poqxgQG2'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recX7RyCsdNV2p168'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recxtb5aLs6OAAKIg'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recfLjzQKBD8Umdcx'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recetgnhc67yFnWbl'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recPrXhP0X07OdHXe'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'reclDKLSXIsr4xoZp'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recmLZ0CypLpsxm96'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec2zofANqBsZdecI'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'reckgdGuUyHtQvhRo'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'reclY3njuk6EySJuU'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec5V9gp65a58nnco'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recKjdLuENEtJLx0f'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recfSZlSomGI9PQjn'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recg4t3r8Cs7RPKXY'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recDl1yX3l2SWb9ju'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recZ6RUx2zcIaRAIC'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recdwoJE9Po9zdf0A'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'receRbbt9Lb661wFB'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec71e3PSct2zLEMj'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recpyHTeNkGnFnqhZ'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recHvlTH8v706UYvc'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recagUd44RPEWti0X'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recrvTvLTUXEcUIV1'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec7QdcMIhYfmkgq9'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recIkcTpbNZy9YetV'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'reciVlfNtTgkQJCHt'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec5LVAAMsUHYx5eD'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recvMdYj3tPrMa79u'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recB1qZjFA0s2UsdU'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recmMMVns3LEFkHeO'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recfRe4luCCP8GoVA'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'reckyBHOf8yIl2UGq'
  }),];
  const buildBadgePartnerCompetence2Skills = [databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recybd8jWDNiFpbgq'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recL4pRDGJZhgxsEL'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recMOxOdfesur8E7L'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rectLj7NPg5JcSIqN'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recL0AotZshb9quhR'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recrOwaV2PTt1N0i5'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recyblYaLq5YHTSRk'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec9qal2FLjWysrfu'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rechRPFlSryfY3UnG'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'reciVXqruKqnV4haA'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recbwejYcw1T1zA06'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recJLroTYxcfbczfW'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recuE3dO6Qjnfbu2y'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recsPpUso9cY2u1I8'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recH8iHKeJ5iws289'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec9uQTL8ZFm1rSTY'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recPgkHUdzk0HPGt1'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'reclX9KELFBQeVKoC'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recBsT8BoStvZP6av'
  }),];
  const buildBadgePartnerCompetence3Skills = [databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recZnnTU4WUP6KwwX'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rececWx6MmPhufxXk'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recAFoEonOOChXe9t'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recaMBgjv3EZnAlWO'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recXDYAkqqIDCDePc'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recwOLZ8bzMQK9NF9'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recR1SlS7sWoquhoC'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recPGDVdX0LSOWQQC'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec0tk8dZWOzSQbaQ'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recmoanUlDOyXexPF'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recKbNbM8G7mKaloD'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recEdU3ZJrHxWOLcb'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recfktfO0ROu1OifX'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec7WOXWi5ClE8BxH'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recHo6D1spbDR9C2N'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recpdpemRXuzV9r10'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recWXtN5cNP1JQUVx'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec7EvARki1b9t574'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec6IWrDOSaoX4aLn'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recI4zS51by3N7Ryi'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recrV8JAEsieJOAch'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recHBMRraNImyqmDF'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recaTPKUCD6uAS0li'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recicaqEeoJUtXT6j'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recDotNI5r7ApHfwa'
  }),];
  const buildBadgePartnerCompetence4Skills = [databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recTIddrkopID28Ep'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recBrDIfDDW2IPpZV'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recixKw4lXIiHue01'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recLYUZrWeizc4G5d'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recgOc2OreHCosoRp'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recb0ZHKckwrnZeb8'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recF9oTiR8fMSnQoo'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recm2r3CA4crfigAk'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recWjPO6uH6NqaiD4'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec0o0fVvpExTlZGp'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec8Ot7GXqSJLn99A'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recOYQhD9e6c3YkPu'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recLXE4vlQ5vcGsLP'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'reco16sNopoBMdhnQ'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recgs5q5APUX7kcRp'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recvo2KPsvK0fnIIN'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'reci70rsZPmL12z5b'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recX6aP7OkjU9PVWE'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recUdMS2pRSF4sgnk'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recVgnoo6RjCxjCQp'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recLsem0KbElkpjvp'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recSByLc0DNQ8F0D1'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recEAJG3c7SNoiUcj'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'reclCMZpPDx3eQ46q'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recQdr7rbPZ3Kh6Ef'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recLhYgOVFwOmQSLn'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recfuk3QLAOzBQzSU'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recXZWPaaJ6jlcmtq'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec2Kg1bqEZVI8fBh'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recx7WnZJCXVgCvN4'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recAzV1ljhCdjrasn'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec9IR04aOpn5aSCP'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recJGN6S3MmTZVa5O'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'recUCuU7EMEHAysmp'
  }), databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: pixEmploiProfile.id,
    skillId: 'rec2DvazCDkBnqOmK'
  }),];

  const badge = databaseBuilder.factory.buildBadge({
    id: BADGE_PIX_EMPLOI_ID,
    altMessage: 'Vous avez validé le badge Pix Emploi.',
    imageUrl: '/images/badges/Pix-emploi.svg',
    key: Badge.keys.PIX_EMPLOI_CLEA,
    message: 'Bravo ! Vous maîtrisez les compétences indispensables pour utiliser le numérique en milieu professionnel. ' +
      'Pour valoriser vos compétences avec une double certification Pix-CléA numérique, renseignez-vous auprès de votre conseiller ou de votre formateur.',
    targetProfileId: pixEmploiProfile.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name : 'Rechercher des informations sur internet',
    color : 'jaffa',
    skillIds: buildBadgePartnerCompetence1Skills.map((s) => s.skillId),
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name : 'Utiliser des outils informatiques',
    color : 'wild-strawberry',
    skillIds: buildBadgePartnerCompetence2Skills.map((s) => s.skillId),
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name : 'Naviguer sur internet',
    color : 'jaffa',
    skillIds: buildBadgePartnerCompetence3Skills.map((s) => s.skillId),
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name : 'Partager sur les réseaux sociaux',
    color : 'emerald',
    skillIds: buildBadgePartnerCompetence4Skills.map((s) => s.skillId),
    badgeId: badge.id,
  });

}

module.exports = {
  pixEmploiTargetProfileBuilder,
  BADGE_PIX_EMPLOI_ID,
};
