const buildArea = function buildArea({
  id = 'recvoGdo7z2z7pXWa',
  competenceIds = [
    'recsvLz0W2ShyfD63',
    'recNv8qhaY887jQb2',
    'recIkYm646lrGvLNT',
  ],
  couleur = 'jaffa',
  code = '1',
  titre = 'Information et données',
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
      'Titre': titre,
      'Nom': nom,
      'Competences (nom complet)': nomCompetences,
    },
    'createdTime': createdTime,
  };
};

module.exports = buildArea;
