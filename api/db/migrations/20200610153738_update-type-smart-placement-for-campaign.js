const TABLE_NAME = 'assessments';

exports.up = function(knex) {
  return knex(TABLE_NAME)
    .where('type', 'SMART_PLACEMENT')
    .update({ type: 'CAMPAIGN', courseId: '[NOT USED] Campaign Assessment CourseId Not Used' });
};

exports.down = function(knex) {
  return knex(TABLE_NAME)
    .where('type', 'CAMPAIGN')
    .update({ type: 'SMART_PLACEMENT', courseId: 'Smart Placement Tests CourseId Not Used' });
};
