
const TABLE_NAME_MARKS = 'marks';
const TABLE_NAME_COMPETENCE_MARKS = 'competence-marks';
const TABLE_NAME_CORRECTIONS = 'corrections';

exports.up = function(knex, Promise) {
  return knex(TABLE_NAME_MARKS)
    .select('id','level', 'score', 'area_code', 'competence_code','correctionId')
    .then((allMarks) => {
      const promises = allMarks.map(mark => {
        return knex(TABLE_NAME_COMPETENCE_MARKS)
          .insert({
            level: mark.level,
            score: mark.score,
            area_code: mark.area_code,
            competence_code: mark.competence_code,
            correctionId: mark.correctionId
          });
      });
      return Promise.all(promises);
    }).then(() => {
      knex.schema
        .dropTable(TABLE_NAME_MARKS)
        .then(() => {
          console.log(`${TABLE_NAME_MARKS} table was dropped!`);
        });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .createTable(TABLE_NAME_MARKS, (t) => {
      t.increments().primary();
      t.integer('level').unsigned();
      t.integer('score').unsigned();
      t.text('area_code').notNull();
      t.text('competence_code').notNull();
      t.integer('assessmentId').unsigned().references('assessments.id');
      t.integer('correctionId').unsigned();
    })
    .then(() => {
      return knex(TABLE_NAME_COMPETENCE_MARKS)
        .select('id', 'level', 'score', 'area_code', 'competence_code', 'correctionId')
        .then((allMarks) => {
          const promises = allMarks.map(mark => {
            return knex(TABLE_NAME_MARKS)
              .insert({
                level: mark.level,
                score: mark.score,
                area_code: mark.area_code,
                competence_code: mark.competence_code,
                correctionId: mark.correctionId
              });
          });
          return Promise.all(promises);
        });
    })
    .then(() => {
      return knex(TABLE_NAME_CORRECTIONS)
        .select('id', 'assessmentId');
    }).then((allCorrections) => {
      const promises = allCorrections.map(correction => {
        return knex(TABLE_NAME_MARKS)
          .where('correctionId', '=', correction.id)
          .update({
            assessmentId: correction.assessmentId
          });
      });
      return Promise.all(promises);

    });
};
