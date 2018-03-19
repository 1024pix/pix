#! /usr/bin/env node
/* eslint no-console: ["off"] */
const { Client } = require('pg');

function initialize() {
  const client = new Client(process.env.DATABASE_URL);
  client.connect();

  client.logged_query = function(query) {
    console.log(`query: ${query}`);
    return this.query(query)
      .then((result) => {
        const { command, rowCount, rows } = result;
        console.log(`result: command ${command} (rowCount ${rowCount}) = ${JSON.stringify(rows)}`);
        return result;
      });
  };
  const user_email = process.argv[2];
  return { client, user_email };
}

function terminate(client) {
  client.end();
  console.log('END');
}

function main() {
  const { client, user_email } = initialize();
  const queryBuilder = new ScriptQueryBuilder();
  const clientQueryAdapter = new ClientQueryAdapter();
  const userEraser = new UserEraser(client, queryBuilder, clientQueryAdapter);

  Promise.resolve()
    .then(() => client.logged_query('BEGIN'))

    .then(() => userEraser.fetch_user_id_from_email(user_email))
    .then(() => userEraser.check_no_certification_done())
    .then(() => userEraser.find_assessment_ids_from_fetched_user_id())
    .then(() => userEraser.delete_dependent_data_from_fetched_assessment_ids())
    .then(() => userEraser.delete_assessments_from_fetched_user_id())
    .then(() => userEraser.delete_user_from_fetched_user_id())

    .then(() => client.logged_query('COMMIT'))
    .then(() => console.log('FINISHED'))
    .catch((err) => {
      console.log(`ERROR: ${err}\nRollback...`);
      return client.logged_query('ROLLBACK')
        .then(() => console.log('Rollback finished'));
    })
    // finally
    .then(() => terminate(client))
    .catch(() => terminate(client));
}

class UserEraser {
  constructor(client, queryBuilder, clientQueryAdapter) {
    Object.assign(this, { client, queryBuilder, clientQueryAdapter });
  }

  fetch_user_id_from_email(userEmail) {
    return Promise.resolve()
      .then(() => this.queryBuilder.get_user_id_from_email(userEmail))
      .then((query) => this.client.logged_query(query))
      .then((result) => this.userId = this.clientQueryAdapter.unpack_user_id(result));
  }

  find_assessment_ids_from_fetched_user_id() {
    return Promise.resolve()
      .then(() => this.queryBuilder.find_assessment_ids_from_user_id(this.userId))
      .then((query) => this.client.logged_query(query))
      .then((result) => this.assessmentIds = this.clientQueryAdapter.unpack_assessment_ids(result));
  }

  delete_dependent_data_from_fetched_assessment_ids() {
    if (this.assessmentIds.length === 0) {
      console.log('No assessment found: skipping deletion of feedbacks, skills, marks, and answers');
      return Promise.resolve();
    }

    return Promise.resolve()
      .then(() => [
        this.queryBuilder.delete_feedbacks_from_assessment_ids(this.assessmentIds),
        this.queryBuilder.delete_skills_from_assessment_ids(this.assessmentIds),
        this.queryBuilder.delete_answers_from_assessment_ids(this.assessmentIds),
        this.queryBuilder.delete_marks_from_assessment_ids(this.assessmentIds)
      ])
      .then((queries) => Promise.all(
        queries.map((query) => {
          this.client.logged_query(query);
        })
      ));
  }

  delete_assessments_from_fetched_user_id() {
    return Promise.resolve()
      .then(() => this.queryBuilder.delete_assessments_from_user_id(this.userId))
      .then((query) => this.client.logged_query(query));
  }

  delete_user_from_fetched_user_id() {
    return Promise.resolve()
      .then(() => this.queryBuilder.delete_user_from_user_id(this.userId))
      .then((query) => this.client.logged_query(query));
  }

  check_no_certification_done() {
    return Promise.resolve()
      .then(() => this.queryBuilder.count_certifications_from_user_id(this.userId))
      .then((query) => this.client.logged_query(query))
      .then((result) => {
        if(this.clientQueryAdapter.count(result) > 0)
          return Promise.reject('The user has been certified, deletion impossible');
      });
  }
}

class ClientQueryAdapter {

  unpack_user_id(result) {
    return result.rows[0].id;
  }

  unpack_assessment_ids(result) {
    return result.rows.map(({ id }) => id);
  }

  count(result) {
    return result.rows[0].count;
  }
}

class ScriptQueryBuilder {

  get_user_id_from_email(email) {
    return `SELECT id FROM users WHERE email = '${email}'`;
  }

  count_certifications_from_user_id(id) {
    return `SELECT COUNT(*) FROM "certification-courses" WHERE "userId" = '${id}'`;
  }

  find_assessment_ids_from_user_id(user_id) {
    return `SELECT id FROM assessments WHERE "userId" = '${user_id}'`;
  }

  delete_skills_from_assessment_ids(assessment_ids) {
    this._precondition_array_must_not_be_empty(assessment_ids);
    return `DELETE FROM skills WHERE "assessmentId" IN (${assessment_ids.join(',')})`;
  }

  delete_answers_from_assessment_ids(assessment_ids) {
    this._precondition_array_must_not_be_empty(assessment_ids);
    return `DELETE FROM answers WHERE "assessmentId" IN (${assessment_ids.join(',')})`;
  }

  delete_feedbacks_from_assessment_ids(assessment_ids) {
    this._precondition_array_must_not_be_empty(assessment_ids);
    return `DELETE FROM feedbacks WHERE "assessmentId" IN (${assessment_ids.join(',')})`;
  }

  delete_marks_from_assessment_ids(assessment_ids) {
    this._precondition_array_must_not_be_empty(assessment_ids);
    return `DELETE FROM marks WHERE "assessmentId" IN (${assessment_ids.join(',')})`;
  }

  delete_assessments_from_user_id(user_id) {
    return `DELETE FROM assessments WHERE "userId" = '${user_id}'`;
  }

  delete_user_from_user_id(user_id) {
    return `DELETE FROM users WHERE "id" = '${user_id}'`;
  }

  _precondition_array_must_not_be_empty(assessment_ids) {
    if (assessment_ids.length === 0) {
      throw new Error('asssessment_ids array must not be empty');
    }
  }
}

/*=================== tests =============================*/

if (process.env.NODE_ENV !== 'test') {
  main();
}

module.exports = {
  ScriptQueryBuilder,
  ClientQueryAdapter,
  UserEraser
};
