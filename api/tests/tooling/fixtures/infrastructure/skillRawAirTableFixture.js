const AirtableRecord = require('airtable').Record;

const ACTIVE_STATUS = 'actif';
const COMPETENCE_TUBE_ID = 'Compétence (via Tube) (id persistant)';
const STATUS = 'Status';

class SkillRawAirTableFixture extends AirtableRecord {
  constructor(id) {
    super('Skill', id,{
      'id': id,
      'fields': {
        'id persistant': id,
        'Nom': '@accesDonnées1',
        'Indice': 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?',
        'Statut de l\'indice': 'Validé',
        [STATUS]: ACTIVE_STATUS,
        'Epreuves': [
          'recF2iWmZKIuOsKO1',
          'recYu7YmDXXt5Owo8',
          'recbH4xMDsDZnRzzN'
        ],
        [COMPETENCE_TUBE_ID]: [
          'recofJCxg0NqTqTdP'
        ],
        'Comprendre (id persistant)': [
          'receomyzL0AmpMFGw'
        ],
        'PixValue': 2.4,
        'En savoir plus (id persistant)': [
          'recQbjXNAPsVJthXh',
          'rec3DkUX0a6RNi2Hz'
        ],
        'Tags': [
          'recdUq3RwhedQoRwS'
        ],
        'Tube (id persistant)': [
          'recofJCazertqTdP'
        ]
      },
      'createdTime': '2018-01-31T12:41:07.000Z'
    });
  }

  withCompetenceId(id) {
    this.fields[COMPETENCE_TUBE_ID] = [id];
    return this;
  }

  withActiveStatus() {
    this.fields[STATUS] = ACTIVE_STATUS;
    return this;
  }

  withInactiveStatus() {
    this.fields[STATUS] = 'périmé';
    return this;
  }
}

function skillRawAirTableFixture({ id } = { id: 'recTIddrkopID28Ep' }) {
  return new SkillRawAirTableFixture(id);
}

module.exports = skillRawAirTableFixture;
