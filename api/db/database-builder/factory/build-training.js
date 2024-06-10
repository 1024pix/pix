import { databaseBuffer } from '../database-buffer.js';

/**
 * @typedef {{
 *  id: number,
 *  title: string,
 *  link: string,
 *  type: string,
 *  duration: string,
 *  locale: string,
 *  editorName: string,
 *  editorLogoUrl: string,
 *  createdAt: Date,
 *  updatedAt: Date
 * }} Training
 */

function buildTraining({
  id = databaseBuffer.getNextId(),
  title = 'title',
  link = 'http://mon-link.com',
  type = 'webinaire',
  duration = '06:00:00',
  locale = 'fr-fr',
  editorName = "Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité",
  editorLogoUrl = 'https://images.pix.fr/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
  isDisabled = false,
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {
  const values = {
    id,
    title,
    link,
    type,
    duration,
    locale,
    editorName,
    editorLogoUrl,
    isDisabled,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'trainings',
    values,
  });
}

/**
 * @typedef {
 *  function(Partial<Training>): Training
 * } BuildTraining
 */
export { buildTraining };
