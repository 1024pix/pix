module.exports = function buildCourse({
  id = 'recPBOj7JzBcgXEtO',
  nom = '3.4 niveau 1 et 2',
  description = 'Programmer niveau 1 et 2',
  image = [
    {
      'id': 'attTfsUGDDMNOJWcM',
      'url': 'https://dl.airtable.com/otNiedKYSTBmoAPdyIk2_woman-163426_1920.jpg',
      'filename': 'woman-163426_1920.jpg',
      'size': 442365,
      'type': 'image/jpeg',
      'thumbnails': {
        'small': {
          'url': 'https://dl.airtable.com/m5D4qlqTQMaFMpT5n0Es_small_woman-163426_1920.jpg',
          'width': 57,
          'height': 36,
        },
        'large': {
          'url': 'https://dl.airtable.com/vumaPuYTb2af6FyMO2wQ_large_woman-163426_1920.jpg',
          'width': 512,
          'height': 512,
        },
        'full': {
          'url': 'https://dl.airtable.com/MXte8x6CR7lm3hNTyWXR_full_woman-163426_1920.jpg',
          'width': 1920,
          'height': 1208,
        },
      },
    },
  ],
  epreuves = [
    'rec3XmZPwLagZl7Ku',
    'recFbiP4dLuKL61NJ',
    'recIN1NGPekHJ9S4l',
    'recUceYsrMAu38COe',
    'recZvwJWOh1ruV0QG',
    'recgaM9thmu7t3qnj',
    'recj8n1giB5f1It04',
    'recs9uvUWKQ4HDzw6',
  ],
  statut = 'Brouillon',
  preview = 'http://staging.pix.fr/courses/recPBOj7JzBcgXEtO',
  nbDEpreuves = 8,
  acquis = ',,,,@langBalise2,@écrireAlgo3,@écrireAlgo1,@exécuterAlgo1',
  adaptatif = true,
  defiDeLaSemaine = false,
  competence = ['rec8116cdd76088af'],
  createdTime = '2016-10-30T10:41:01.000Z',
} = {}) {

  return {
    id,
    'fields': {
      'id persistant': id,
      'Nom': nom,
      'Description': description,
      'Image': image,
      'Épreuves (id persistant)': epreuves,
      'Statut': statut,
      'Preview': preview,
      'Nb d\'épreuves': nbDEpreuves,
      'Acquis': acquis,
      'Adaptatif ?': adaptatif,
      'Défi de la semaine ?': defiDeLaSemaine,
      'Competence (id persistant)': competence,
    },
    'createdTime': createdTime,
  };
};
