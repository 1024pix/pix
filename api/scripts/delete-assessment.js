#! /usr/bin/env node
/* eslint no-console: ["off"] */
const PgClient = require('./PgClient');

function initialize() {
  const client = new PgClient(process.env.DATABASE_URL);

  const assessment_id = process.argv[2];
  return { client, assessment_id };
}

function terminate(client) {
  client.end();
  console.log('END');
}

function main() {
  const { client, assessment_id } = initialize();

  const queryBuilder = new ScriptQueryBuilder();
  const userEraser = new AssessmentEraser(client, queryBuilder, assessment_id);

  Promise.resolve()
    .then(() => client.query_and_log('BEGIN'))
    .then(() => userEraser.delete_dependent_data_from_assessment_id())
    .then(() => userEraser.delete_assessment_from_id())
    .then(() => client.query_and_log('COMMIT'))
    .then(() => console.log('FINISHED'))
    .catch((err) => {
      console.log(`ERROR: ${err}\nRollback...`);
      return client.query_and_log('ROLLBACK')
        .then(() => console.log('Rollback finished'));
    })
    // finally
    .then(() => terminate(client))
    .catch(() => terminate(client));
}

class AssessmentEraser {
  constructor(client, queryBuilder, assessment_id) {
    Object.assign(this, { client, queryBuilder, assessment_id });
  }

  delete_dependent_data_from_assessment_id() {

    if (!this.assessment_id) {
      return Promise.reject(new Error('Missing argument : an assessment id should be provided'));
    }

    return Promise.resolve()
      .then(() => [
        this.queryBuilder.delete_feedbacks_from_assessment_ids(this.assessment_id),
        this.queryBuilder.delete_skills_from_assessment_ids(this.assessment_id),
        this.queryBuilder.delete_answers_from_assessment_ids(this.assessment_id),
        this.queryBuilder.delete_marks_from_assessment_ids(this.assessment_id)
      ])
      .then((queries) => Promise.all(
        queries.map((query) => {
          this.client.query_and_log(query);
        })
      ));
  }

  delete_assessment_from_id() {
    return Promise.resolve()
      .then(() => this.queryBuilder.delete_assessment_from_id(this.assessment_id))
      .then((query) => this.client.query_and_log(query));
  }
}

class ScriptQueryBuilder {

  delete_skills_from_assessment_ids(assessment_id) {
    return `DELETE FROM skills WHERE "assessmentId" = ${assessment_id}`;
  }

  delete_answers_from_assessment_ids(assessment_id) {
    return `DELETE FROM answers WHERE "assessmentId" = ${assessment_id}`;
  }

  delete_feedbacks_from_assessment_ids(assessment_id) {
    return `DELETE FROM feedbacks WHERE "assessmentId" = ${assessment_id}`;
  }

  delete_marks_from_assessment_ids(assessment_id) {
    return `DELETE FROM marks WHERE "assessmentId" = ${assessment_id}`;
  }

  delete_assessment_from_id(id) {
    return `DELETE FROM assessments WHERE id = '${id}'`;
  }
}

/*=================== tests =============================*/

if (process.env.NODE_ENV !== 'test') {
  main();
}

module.exports = {
  ScriptQueryBuilder,
  AssessmentEraser
};
