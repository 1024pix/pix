const TABLE_NAME = 'trainings';
const EDITOR_NAME_COLUMN = 'editorName';
const EDITOR_LOGO_URL_COLUMN = 'editorLogoUrl';
const editorName = "Ministère de l'Éducation nationale et de la Jeunesse";
const editorLogoUrl =
  'https://images.pix.fr/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.string(EDITOR_NAME_COLUMN).default(editorName).notNullable();
    table.string(EDITOR_LOGO_URL_COLUMN).default(editorLogoUrl).notNullable();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(EDITOR_NAME_COLUMN);
    table.dropColumn(EDITOR_LOGO_URL_COLUMN);
  });
};
