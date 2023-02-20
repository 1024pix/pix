import { batch } from '../batch-processing';
const TABLE_NAME_ASSESSMENTS = 'assessments';
const TABLE_NAME_CERTIFICATIONS = 'certification-courses';
const LIST_COMPETENCES_PLACEMENT = [
  'recRlIVstCemVM8jE',
  'recfLYUy8fYlcyAsl',
  'recxlkyNjuu4cJuuF',
  'recAY0W7xurA11OLZ',
  'recRKkLdx99wfl3qs',
  'recVtTay20uxEqubF',
  'recye6vmFsi8ernH4',
  'rec43mpMIR5dUzdjh',
  'recTMfUJzFaNiUt64',
  'recO1qH39C0IfggLZ',
  'recNPB7dTNt5krlMA',
  'recrJ90Sbrotzkb7x',
  'rec5gEPqhxYjz15eI',
  'recHOjJHVxjD8m9bz',
  'recR9yCEqgedB0LYQ',
  'recyochcrrSOALQPS',
];
const TYPE_PLACEMENT = 'PLACEMENT';
const TYPE_CERTIFICATION = 'CERTIFICATION';
const TYPE_DEMO = 'DEMO';
const TYPE_PREVIEW = 'PREVIEW';

export const up = function (knex) {
  // XXX : Modify PREVIEW assessments
  return knex(TABLE_NAME_ASSESSMENTS)
    .select('id', 'courseId', 'type')
    .whereNull('type')
    .where('courseId', 'LIKE', 'null%')
    .then((allAssessmentsPreview) => {
      return batch(knex, allAssessmentsPreview, (assessment) => {
        return knex(TABLE_NAME_ASSESSMENTS).where('id', '=', assessment.id).update({
          type: TYPE_PREVIEW,
        });
      });
    })
    .then(() => {
      // XXX : Modify PLACEMENT assessments
      return knex(TABLE_NAME_ASSESSMENTS)
        .select('id', 'courseId', 'type')
        .whereNull('type')
        .where('courseId', 'IN', LIST_COMPETENCES_PLACEMENT);
    })
    .then((allAssessmentsPlacement) => {
      return batch(knex, allAssessmentsPlacement, (assessment) => {
        return knex(TABLE_NAME_ASSESSMENTS).where('id', '=', assessment.id).update({
          type: TYPE_PLACEMENT,
        });
      });
    })
    .then(() => {
      // XXX : Modify CERTIFICATION assessments
      return knex(TABLE_NAME_CERTIFICATIONS).select('id');
    })
    .then((allCertifications) => {
      const certificationsId = allCertifications.map((certification) => certification.id.toString());
      return knex(TABLE_NAME_ASSESSMENTS)
        .select('id', 'courseId', 'type')
        .whereNull('type')
        .where('courseId', 'IN', certificationsId);
    })
    .then((allAssessmentsCertifications) => {
      return batch(knex, allAssessmentsCertifications, (assessment) => {
        return knex(TABLE_NAME_ASSESSMENTS).where('id', '=', assessment.id).update({
          type: TYPE_CERTIFICATION,
        });
      });
    })
    .then(() => {
      // XXX : Modify DEMO assessments

      return knex(TABLE_NAME_ASSESSMENTS).select('id', 'courseId', 'type').whereNull('type');
    })
    .then((allAssessmentsDemo) => {
      return batch(knex, allAssessmentsDemo, (assessment) => {
        return knex(TABLE_NAME_ASSESSMENTS).where('id', '=', assessment.id).update({
          type: TYPE_DEMO,
        });
      });
    });
};

export const down = function () {
  return;
};
