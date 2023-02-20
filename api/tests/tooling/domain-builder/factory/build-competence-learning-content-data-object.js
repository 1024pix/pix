export default function buildCompetenceLearningContentDataObject({
  id = 'recsvLz0W2ShyfD63',
  name = 'Mener une recherche et une veille d’information',
  nameFrFr = 'Mener une recherche et une veille d’information',
  nameEnUs = 'Browsing, searching and filtering data, information and digital content',
  index = '1.1',
  areaId = 'recvoGdo7z2z7pXWa',
  description = 'Une description',
  descriptionFrFr = 'Une description',
  descriptionEnUs = 'Some description',
  origin = 'Pix',
  skillIds = [
    'recV11ibSCXvaUzZd',
    'recD01ptfJy7c4Sex',
    'recfO8994EvSQV9Ip',
    'recDMMeHSZRCjqo5x',
    'reci0phtJi0lvqW9j',
    'recUQSpjuDvwqKMst',
    'recxqogrKZ9p8b1u8',
    'recRV35kIeqUQj8cI',
    'rec50NXHkatsRkjVQ',
  ],
} = {}) {
  return {
    id,
    name,
    name_i18n: {
      fr: nameFrFr,
      en: nameEnUs,
    },
    index,
    areaId,
    origin,
    skillIds,
    description,
    description_i18n: {
      fr: descriptionFrFr,
      en: descriptionEnUs,
    },
  };
}
