const TABLE_NAME = 'competence-marks';
const COLUMN_NAME = 'competenceId';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME);
  });
  return knex.raw(
    `
  UPDATE ?? SET ?? = CASE ??
  WHEN ? THEN ?
  WHEN ? THEN ?
  WHEN ? THEN ?
  WHEN ? THEN ?
  WHEN ? THEN ?
  WHEN ? THEN ?
  WHEN ? THEN ?
  WHEN ? THEN ?
  WHEN ? THEN ?
  WHEN ? THEN ?
  WHEN ? THEN ?
  WHEN ? THEN ?
  WHEN ? THEN ?
  WHEN ? THEN ?
  WHEN ? THEN ?
  WHEN ? THEN ?
  ELSE NULL END
  `,
    [
      TABLE_NAME,
      COLUMN_NAME,
      'competence_code',
      '1.1',
      'recsvLz0W2ShyfD63',
      '1.2',
      'recIkYm646lrGvLNT',
      '1.3',
      'recNv8qhaY887jQb2',
      '2.1',
      'recDH19F7kKrfL3Ii',
      '2.2',
      'recgxqQfz3BqEbtzh',
      '2.3',
      'recMiZPNl7V1hyE1d',
      '2.4',
      'recFpYXCKcyhLI3Nu',
      '3.1',
      'recOdC9UDVJbAXHAm',
      '3.2',
      'recbDTF8KwupqkeZ6',
      '3.3',
      'recHmIWG6D0huq6Kx',
      '3.4',
      'rece6jYwH4WEw549z',
      '4.1',
      'rec6rHqas39zvLZep',
      '4.2',
      'recofJCxg0NqTqTdP',
      '4.3',
      'recfr0ax8XrfvJ3ER',
      '5.1',
      'recIhdrmCuEmCDAzj',
      '5.2',
      'recudHE5Omrr10qrx',
    ]
  );
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
