import { databaseBuffer } from '../../database-buffer.ts';

export function buildTutorial({
  id = 'tutorialIdA',
  duration = 'duration Tutoriel A',
  format = 'format Tutoriel A',
  title = 'title Tutoriel A',
  source = 'source Tutoriel A',
  link = 'link Tutoriel A',
  locale = 'fr',
} = {}) {
  return buildTutorialInDB({ id, duration, format, title, source, link, locale });
}

export function buildTutorialWithNoDefaultValues({ id, duration, format, title, source, link, locale }) {
  return buildTutorialInDB({ id, duration, format, title, source, link, locale });
}

function buildTutorialInDB({ id, duration, format, title, source, link, locale }) {
  const values = {
    id,
    duration,
    format,
    title,
    source,
    link,
    locale,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'learningcontent.tutorials',
    values,
  });
}
