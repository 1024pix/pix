import { Training } from '../../../src/devcomp/domain/models/Training.js';
import { databaseBuffer } from '../database-buffer.js';

/**
 * @typedef {{
 *  id: number,
 *  title: string,
 *  internalTitle: string,
 *  link: string,
 *  type: string,
 *  duration: string,
 *  locales: string[],
 *  editorName: string,
 *  editorLogoUrl: string,
 *  isDisabled: boolean,
 *  createdAt: Date,
 *  updatedAt: Date,
 *  deliveryMode: string,
 *   registrationRequired: boolean,
 *   program: string,
 *   objectives: string[],
 *   description: string,
 * }} Training
 */

function buildTraining({
  id = databaseBuffer.getNextId(),
  title = 'title',
  internalTitle = 'internal title',
  link = 'http://mon-link.com',
  type = 'webinaire',
  duration = '06:00:00',
  locales = ['fr-fr'],
  editorName = "Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité",
  editorLogoUrl = 'https://assets.pix.org/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
  isDisabled = false,
  createdAt = new Date(),
  updatedAt = new Date(),
  deliveryMode = Training.modes.HYBRID,
  registrationRequired = false,
  program = 'Programme du contenu formatif',
  objectives = [],
  description = "<p>Voici la description d'un contenu formatif</p>",
} = {}) {
  const values = {
    id,
    title,
    internalTitle,
    link,
    type,
    duration,
    locales,
    editorName,
    editorLogoUrl,
    isDisabled,
    createdAt,
    updatedAt,
    deliveryMode,
    registrationRequired,
    program,
    objectives,
    description,
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
