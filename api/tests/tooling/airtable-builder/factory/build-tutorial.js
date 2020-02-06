module.exports = function buildTutorial({
  id = 'recTIddrgjhID28Ep',
  titre = 'Communiquer',
  format = 'vidéo',
  duree = '00:03:31',
  source = 'Source Example, Example',
  lien = 'http://www.example.com/this-is-an-example.html',
  createdTime = '2018-03-15T14:38:03.000Z',
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
    },
    'createdTime': createdTime,
  };
};
