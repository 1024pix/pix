export default function buildAreaLearningContentDataObject({
  id = 'recvoGdo7z2z7pXWa',
  code = '1',
  name = '1. Information et données',
  titleFrFr = 'Information et données',
  titleEnUs = 'Information and data',
  competenceIds = ['recsvLz0W2ShyfD63', 'recNv8qhaY887jQb2', 'recIkYm646lrGvLNT'],
  color = 'jaffa',
} = {}) {
  return {
    id,
    code,
    name,
    title_i18n: {
      fr: titleFrFr,
      en: titleEnUs,
    },
    competenceIds,
    color,
  };
}
