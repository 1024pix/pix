export const up = async function (knex) {
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '1.1').update({
    competenceId: 'recsvLz0W2ShyfD63',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '1.2').update({
    competenceId: 'recIkYm646lrGvLNT',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '1.3').update({
    competenceId: 'recNv8qhaY887jQb2',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '2.1').update({
    competenceId: 'recDH19F7kKrfL3Ii',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '2.2').update({
    competenceId: 'recgxqQfz3BqEbtzh',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '2.3').update({
    competenceId: 'recMiZPNl7V1hyE1d',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '2.4').update({
    competenceId: 'recFpYXCKcyhLI3Nu',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '3.1').update({
    competenceId: 'recOdC9UDVJbAXHAm',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '3.2').update({
    competenceId: 'recbDTF8KwupqkeZ6',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '3.3').update({
    competenceId: 'recHmIWG6D0huq6Kx',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '3.4').update({
    competenceId: 'rece6jYwH4WEw549z',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '4.1').update({
    competenceId: 'rec6rHqas39zvLZep',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '4.2').update({
    competenceId: 'recofJCxg0NqTqTdP',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '4.3').update({
    competenceId: 'recfr0ax8XrfvJ3ER',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '5.1').update({
    competenceId: 'recIhdrmCuEmCDAzj',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '5.2').update({
    competenceId: 'recudHE5Omrr10qrx',
  });
  await knex('competence-marks').whereNull('competenceId').where('competence_code', '6.1').update({
    competenceId: 'recAZLOoUMpe7kF5o',
  });
};

export const down = function () {
  return;
};
