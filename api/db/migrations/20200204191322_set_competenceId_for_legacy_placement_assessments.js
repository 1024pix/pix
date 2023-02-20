const TABLE_NAME = 'assessments';

export const up = function (knex) {
  return knex(TABLE_NAME)
    .where({
      type: 'PLACEMENT',
      competenceId: null,
    })
    .update({
      competenceId: knex.raw(`CASE "courseId"
        WHEN 'rec43mpMIR5dUzdjh' THEN 'recOdC9UDVJbAXHAm'
        WHEN 'rec5gEPqhxYjz15eI' THEN 'recIhdrmCuEmCDAzj'
        WHEN 'recAY0W7xurA11OLZ' THEN 'recIkYm646lrGvLNT'
        WHEN 'recHOjJHVxjD8m9bz' THEN 'recgxqQfz3BqEbtzh'
        WHEN 'recNPB7dTNt5krlMA' THEN 'recsvLz0W2ShyfD63'
        WHEN 'recO1qH39C0IfggLZ' THEN 'rec6rHqas39zvLZep'
        WHEN 'recR9yCEqgedB0LYQ' THEN 'recNv8qhaY887jQb2'
        WHEN 'recRKkLdx99wfl3qs' THEN 'recHmIWG6D0huq6Kx'
        WHEN 'recRlIVstCemVM8jE' THEN 'recfr0ax8XrfvJ3ER'
        WHEN 'recTMfUJzFaNiUt64' THEN 'rece6jYwH4WEw549z'
        WHEN 'recVtTay20uxEqubF' THEN 'recbDTF8KwupqkeZ6'
        WHEN 'recfLYUy8fYlcyAsl' THEN 'recudHE5Omrr10qrx'
        WHEN 'recrJ90Sbrotzkb7x' THEN 'recofJCxg0NqTqTdP'
        WHEN 'recxlkyNjuu4cJuuF' THEN 'recFpYXCKcyhLI3Nu'
        WHEN 'recye6vmFsi8ernH4' THEN 'recMiZPNl7V1hyE1d'
        WHEN 'recyochcrrSOALQPS' THEN 'recDH19F7kKrfL3Ii'
      END`),
    });
};

export const down = function (knex) {
  return knex(TABLE_NAME)
    .where({
      type: 'PLACEMENT',
    })
    .update({
      competenceId: null,
    });
};
