module.exports = function buildTube({
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
