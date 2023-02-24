const databaseBuffer = require('../database-buffer');

function buildTraining({
  id = databaseBuffer.getNextId(),
  title = 'title',
  link = 'http://mon-link.com',
  type = 'webinaire',
  duration = '06:00:00',
  locale = 'fr-fr',
  editorName = "Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité",
  editorLogoUrl = 'https://images.pix.fr/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
  prerequisiteThreshold = 30,
  goalThreshold = 70,
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
    prerequisiteThreshold,
    goalThreshold,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'trainings',
    values,
  });
}
module.exports = buildTraining;
