module.exports = function buildSkill({
  id = 'recTIddrkopID28Ep',
  indice = 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ? Dans quelle condition une application peut-elle utiliser les données de géolocalisation du t...',
  statutDeLIndice = 'Proposé',
  epreuves = [
    'recF2iWmZKIuOsKO1',
    'recYu7YmDXXt5Owo8',
    'recbH4xMDsDZnRzzN',
  ],
  comprendre = [
    'receomyzL0AmpMFGw',
  ],
  enSavoirPlus = [
    'recQbjXNAPsVJthXh',
    'rec3DkUX0a6RNi2Hz',
  ],
  tags = [
    'recdUq3RwhedQoRwS',
  ],
  description = 'connaître les effets d\'une autorisation de géolocalisation accordée à une appli mobile et savoir que la géolocalisation ne fonctionne que si le téléph...',
  statutDeLaDescription = 'Proposé',
  level = 1,
  tube = [
    'rectTJBNUL6lz0sEJ',
  ],
  status = 'actif',
  nom = '@accesDonnées1',
  recordId = id,
  compétenceViaTube = [
    'recofJCxg0NqTqTdP',
  ],
  createdTime = '2018-01-31T12:41:07.000Z',
  pixValue = 2,
} = {}) {

  return {
    id,
    'fields': {
      'id persistant': id,
      'Indice': indice,
      'Statut de l\'indice': statutDeLIndice,
      'Epreuves': epreuves,
      'Comprendre (id persistant)': comprendre,
      'En savoir plus (id persistant)': enSavoirPlus,
      'Tags': tags,
      'Description': description,
      'Statut de la description': statutDeLaDescription,
      'Level': level,
      'Tube': tube,
      'Status': status,
      'Nom': nom,
      'Record Id': recordId,
      'Compétence (via Tube) (id persistant)': compétenceViaTube,
      'PixValue': pixValue,
    },
    'createdTime': createdTime,
  };
};
