const buildCompetence = function buildCompetence({
  id = 'recsvLz0W2ShyfD63',
  domaineIds = [
    'recvoGdo7z2z7pXWa',
  ],
  epreuves = [
    'rec02tVrimXNkgaLD',
    'rec0gm0GFue3PQB3k',
    'rec0hoSlSwCeNNLkq',
    'rec2FcZ4jsPuY1QYt',
    'rec39bDMnaVw3MyMR',
  ],
  sousDomaine = '1.1',
  titre = 'Mener une recherche et une veille d’information',
  titreFrFr = null,
  titreEnUs = null,
  acquisIdentifiants = [
    'recV11ibSCXvaUzZd',
    'recD01ptfJy7c4Sex',
    'recfO8994EvSQV9Ip',
    'recDMMeHSZRCjqo5x',
    'reci0phtJi0lvqW9j',
    'recUQSpjuDvwqKMst',
  ],
  tubes = [
    'recs1vdbHxX8X55G9',
    'reccqGUKgzIOK8f9U',
  ],
  acquisViaTubes = [
    'reci0phtJi0lvqW9j',
    'recL4pRDGJZhgxsEL',
    'recTl8ec3ztj3nPNK',
    'recybd8jWDNiFpbgq',
    'recMOxOdfesur8E7L',
    'rec4Gvnh9kV1NeMsw',
    'recUDrCWD76fp5MsE',
    'reciYwi0NTdCM7kbm',
    'recV11ibSCXvaUzZd',
    'recbtdpzdLz6ZqURl',
    'rectLj7NPg5JcSIqN',
    'recxqogrKZ9p8b1u8',
    'recnLN4ZCdZdTC32I',
    'recRPl7tXR8n2D5xU',
    'recYLxHqrLVUBjF2a',
    'recTIddrkopID28Ep',
  ],
  reference = '1.1 Mener une recherche et une veille d’information',
  testsRecordID = [
    'recNPB7dTNt5krlMA',
  ],
  acquis = [
    '@url2',
    '@url5',
    '@utiliserserv6',
    '@rechinfo1',
    '@eval2',
  ],
  recordID = id,
  domaineTitre = [
    'Information et données',
  ],
  domaineCode = [
    '1',
  ],
  createdTime = '2017-06-13T13:53:17.000Z',
  origin = 'Pix',
} = {}) {

  return {
    id,
    'fields': {
      'id persistant': id,
      'Domaine (id persistant)': domaineIds,
      'Epreuves': epreuves,
      'Sous-domaine': sousDomaine,
      'Titre': titre,
      'Titre fr-fr': titreFrFr,
      'Titre en-us': titreEnUs,
      'Acquis (identifiants)': acquisIdentifiants,
      'Tubes': tubes,
      'Acquis (via Tubes) (id persistant)': acquisViaTubes,
      'Référence': reference,
      'Tests Record ID': testsRecordID,
      'Acquis': acquis,
      'Record ID': recordID,
      'Domaine Titre': domaineTitre,
      'Domaine Code': domaineCode,
      'Origine': origin,
    },
    'createdTime': createdTime,
  };
};

buildCompetence.fromDomain = function buildCompetenceFromDomain({
  domainCompetence,
  locale = 'fr-fr',
  createdAt = '2018-03-15T14:38:03.000Z',
}) {
  return {
    id: domainCompetence.id,
    'fields': {
      'id persistant': domainCompetence.id,
      'Domaine (id persistant)': domainCompetence.area ? [domainCompetence.area.id] : [],
      'Sous-domaine': domainCompetence.index,
      'Titre fr-fr': locale === 'fr-fr' ? domainCompetence.name : 'un titre français',
      'Titre en-us': locale === 'fr-fr' ? 'an english title' : domainCompetence.name,
      'Description fr-fr': locale === 'fr-fr' ? domainCompetence.description : 'une description française',
      'Description en-us': locale === 'fr-fr' ? 'an english description' : domainCompetence.description,
      'Acquis (via Tubes) (id persistant)': domainCompetence.skillIds,
      'Origine': domainCompetence.origin,
    },
    'createdTime': createdAt,
  };
};

module.exports = buildCompetence;
