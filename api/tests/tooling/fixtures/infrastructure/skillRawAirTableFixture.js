const AirtableRecord = require('airtable').Record;

const ACTIVE_STATUS = 'actif';
const COMPETENCE_TUBE_ID = 'Compétence (via Tube) (id persistant)';
const STATUS = 'Status';

const DEFAULT_ID = 'recSK0X22abcdefgh',
  DEFAULT_HINT_FR_FR = 'Peut-on géo-localiser un lapin sur la banquise ?',
  DEFAULT_HINT_EN_US = 'Can we geo-locate a rabbit on the ice floe?',
  DEFAULT_HINT_STATUS = 'Validé',
  DEFAULT_NAME = '@accesDonnées1',
  DEFAULT_TUTORIAL_ID = 'recCO0X22abcdefgh',
  DEFAULT_LEARNING_TUTORIAL_IDS = ['recSP0X22abcdefgh', 'recSP0X23abcdefgh'],
  DEFAULT_COMPETENCE_ID = 'recCT0X22abcdefgh',
  DEFAULT_STATUS = ACTIVE_STATUS,
  DEFAULT_PIX_VALUE = 2.4,
  DEFAULT_TAG = 'recTA0X22abcdefgh',
  DEFAULT_TUBE_ID = 'recTU0X22abcdefgh';

class SkillRawAirTableFixture extends AirtableRecord {
  constructor(id) {
    super('Skill', id,{
      'id': id,
      'fields': {
        'id persistant': id,
        'Nom': DEFAULT_NAME,
        'Indice fr-fr': DEFAULT_HINT_FR_FR,
        'Indice en-us': DEFAULT_HINT_EN_US,
        'Statut de l\'indice': DEFAULT_HINT_STATUS,
        [STATUS]: DEFAULT_STATUS,
        'Epreuves': [],
        [COMPETENCE_TUBE_ID]: [
          DEFAULT_COMPETENCE_ID,
        ],
        'Comprendre (id persistant)': [
          DEFAULT_TUTORIAL_ID,
        ],
        'PixValue': DEFAULT_PIX_VALUE,
        'En savoir plus (id persistant)': [
          ...DEFAULT_LEARNING_TUTORIAL_IDS,
        ],
        'Tags': [
          DEFAULT_TAG,
        ],
        'Tube (id persistant)': [
          DEFAULT_TUBE_ID,
        ],
      },
      'createdTime': '2018-01-31T12:41:07.000Z',
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

  withArchivedStatus() {
    this.fields[STATUS] = 'archivé';
    return this;
  }

  withInactiveStatus() {
    this.fields[STATUS] = 'périmé';
    return this;
  }
}

function skillRawAirTableFixture({ id } = { id: DEFAULT_ID }) {
  return new SkillRawAirTableFixture(id);
}

module.exports = {
  skillRawAirTableFixture,
  DEFAULT_ID,
  DEFAULT_HINT_FR_FR,
  DEFAULT_HINT_EN_US,
  DEFAULT_HINT_STATUS,
  DEFAULT_NAME,
  DEFAULT_TUTORIAL_ID,
  DEFAULT_LEARNING_TUTORIAL_IDS,
  DEFAULT_COMPETENCE_ID,
  DEFAULT_STATUS,
  DEFAULT_PIX_VALUE,
  DEFAULT_TUBE_ID,
};
