const buildSkill = function buildSkill({
  id = 'recTIddrkopID28Ep',
  indiceFr = 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ? Dans quelle condition une application peut-elle utiliser les données de géolocalisation du t...',
  indiceEn = 'Can we gelocate ?',
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
      'Indice fr-fr': indiceFr,
      'Indice en-us': indiceEn,
      'Statut de l\'indice': statutDeLIndice,
      'Epreuves': epreuves,
      'Comprendre (id persistant)': comprendre,
      'En savoir plus (id persistant)': enSavoirPlus,
      'Tags': tags,
      'Description': description,
      'Statut de la description': statutDeLaDescription,
      'Level': level,
      'Tube (id persistant)': tube,
      'Status': status,
      'Nom': nom,
      'Record Id': recordId,
      'Compétence (via Tube) (id persistant)': compétenceViaTube,
      'PixValue': pixValue,
    },
    'createdTime': createdTime,
  };
};

buildSkill.fromDomain = function buildSkillFromDomain({
  domainSkill,
  challengeIds = [],
  status = 'actif',
  createdAt = '2018-03-15T14:38:03.000Z',
}) {
  return {
    id: domainSkill.id,
    fields: {
      'id persistant': domainSkill.id,
      'Indice fr-fr': 'un indice français',
      'Indice en-us': 'an english hint',
      'Statut de l\'indice': 'no status',
      'Epreuves': challengeIds,
      'Comprendre (id persistant)': domainSkill.tutorialIds,
      'En savoir plus (id persistant)': [],
      'Tags': [],
      'Tube (id persistant)': [domainSkill.tubeId],
      'Status': status,
      'Nom': domainSkill.name,
      'Compétence (via Tube) (id persistant)': [domainSkill.competenceId],
      'PixValue': domainSkill.pixValue,
    },
    'createdTime': createdAt,
  };
};

module.exports = buildSkill;
