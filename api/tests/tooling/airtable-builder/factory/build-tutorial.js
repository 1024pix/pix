const buildTutorial = function buildTutorial({
  id = 'recTIddrgjhID28Ep',
  titre = 'Communiquer',
  format = 'vidéo',
  duree = '00:03:31',
  source = 'Source Example, Example',
  lien = 'http://www.example.com/this-is-an-example.html',
  createdTime = '2018-03-15T14:38:03.000Z',
  langue = 'en-us',
} = {}) {

  return {
    id,
    'fields': {
      'id persistant': id,
      'Titre': titre,
      'Format': format,
      'Durée': duree,
      'Source': source,
      'Lien': lien,
      'Langue': langue,
    },
    'createdTime': createdTime,
  };
};

buildTutorial.fromDomain = function buildTutorialFromDomain({
  domainTutorial,
  language = 'fr-fr',
  createdAt = '2018-03-15T14:38:03.000Z',
}) {
  return {
    id: domainTutorial.id,
    fields: {
      'id persistant': domainTutorial.id,
      'Titre': domainTutorial.title,
      'Format': domainTutorial.format,
      'Durée': domainTutorial.duration,
      'Source': domainTutorial.source,
      'Lien': domainTutorial.link,
      'Langue': language,
    },
    'createdTime': createdAt,
  };
};

module.exports = buildTutorial;
