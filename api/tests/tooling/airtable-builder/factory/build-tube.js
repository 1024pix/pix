const buildTube = function buildTube({
  id = 'recTIeergjhID28Ep',
  nom = '@web',
  titre = '',
  description = '',
  titrePratiqueFrFr = 'Titre pratique FR',
  titrePratiqueEnUs = 'Titre pratique EN',
  descriptionPratiqueFrFr = 'Connaitre le sujet FR',
  descriptionPratiqueEnUs = 'Connaitre le sujet EN',
  createdTime = '2018-03-15T14:35:03.000Z',
  competences = [
    'rectTASRUL6lz0sEJ',
  ],
} = {}) {

  return {
    id,
    'fields': {
      'id persistant': id,
      'Nom': nom,
      'Titre': titre,
      'Description': description,
      'Titre pratique fr-fr': titrePratiqueFrFr,
      'Titre pratique en-us': titrePratiqueEnUs,
      'Description pratique fr-fr': descriptionPratiqueFrFr,
      'Description pratique en-us': descriptionPratiqueEnUs,
      'Competences (id persistant)': competences,
    },
    'createdTime': createdTime,
  };
};

buildTube.fromDomain = function buildTubeFromDomain({
  domainTube,
  locale = 'fr-fr',
  createdAt = '2018-03-15T14:38:03.000Z',
}) {
  return {
    id: domainTube.id,
    fields: {
      'id persistant': domainTube.id,
      'Nom': domainTube.name,
      'Titre': domainTube.title,
      'Description': domainTube.description,
      'Titre pratique fr-fr': locale === 'fr-fr' ? domainTube.practicalTitle : 'un titre français',
      'Titre pratique en-us': locale === 'fr-fr' ? 'an english title' : domainTube.practicalTitle,
      'Description pratique fr-fr': locale === 'fr-fr' ? domainTube.practicalDescription : 'une description française',
      'Description pratique en-us': locale === 'fr-fr' ? 'an english description' : domainTube.practicalDescription,
      'Competences (id persistant)': [domainTube.competenceId],
    },
    'createdTime': createdAt,
  };
};

module.exports = buildTube;
