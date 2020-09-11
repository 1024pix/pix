const buildArea = function buildArea({
  id = 'recvoGdo7z2z7pXWa',
  competenceIds = [
    'recsvLz0W2ShyfD63',
    'recNv8qhaY887jQb2',
    'recIkYm646lrGvLNT',
  ],
  couleur = 'jaffa',
  code = '1',
  titreFr = 'Information et données',
  titreEn = 'Information and data',
  nom = '1. Information et données',
  nomCompetences = [
    '1.1 Mener une recherche et une veille d’information',
    '1.3 Traiter des données',
    '1.2 Gérer des données',
  ],
  createdTime = '2017-06-13T13:15:26.000Z',
} = {}) {
  return {
    id,
    'fields': {
      'id persistant': id,
      'Competences (identifiants) (id persistant)': competenceIds,
      'Couleur': couleur,
      'Code': code,
      'Titre fr-fr': titreFr,
      'Titre en-us': titreEn,
      'Nom': nom,
      'Competences (nom complet)': nomCompetences,
    },
    'createdTime': createdTime,
  };
};

buildArea.fromDomain = function buildAreaFromDomain({
  domainArea,
  locale = 'fr-fr',
  createdAt = '2019-04-01T09:00:05.000Z',
}) {
  return {
    id: domainArea.id,
    'fields': {
      'id persistant': domainArea.id,
      'Competences (identifiants) (id persistant)': domainArea.competences,
      'Couleur': domainArea.color,
      'Code': domainArea.code,
      'Titre fr-fr': locale === 'fr-fr' ? domainArea.title : 'un titre français',
      'Titre en-us': locale === 'fr-fr' ? 'an english title' : domainArea.title,
      'Nom': domainArea.name,
    },
    'createdTime': createdAt,
  };
};

module.exports = buildArea;
