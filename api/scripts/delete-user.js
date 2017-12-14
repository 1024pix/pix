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
      console.log('No assessment found: skipping deletion of feedbacks, skills, and answers');
      return Promise.resolve();
    }

    return Promise.resolve()
      .then(() => [
        this.queryBuilder.delete_feedbacks_from_assessment_ids(this.assessmentIds),
        this.queryBuilder.delete_skills_from_assessment_ids(this.assessmentIds),
        this.queryBuilder.delete_answers_from_assessment_ids(this.assessmentIds)
      ])
      .then((queries) => Promise.all(
        queries.map((query) => this.client.logged_query(query))
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
}

class ClientQueryAdapter {

  unpack_user_id(result) {
    return result.rows[0].id;
  }

  unpack_assessment_ids(result) {
    return result.rows.map(({ id }) => id);
  }
}

class ScriptQueryBuilder {

  get_user_id_from_email(email) {
    return `SELECT id FROM users WHERE email = '${email}'`;
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
    this._precondition_array_must_not_be_empty(assessment_ids)
    return `DELETE FROM feedbacks WHERE "assessmentId" IN (${assessment_ids.join(',')})`;
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

if (!process.env.TEST) {
  main();
} else {
  const { describe, it, beforeEach } = require('mocha');
  const { expect } = require('chai');

  describe('ScriptQueryBuilder', () => {
    let subject;

    beforeEach(() => {
      subject = new ScriptQueryBuilder();
    });

    describe('#get_user_id_from_email', () => {
      it('should return the correct query', () => {
        // arrange
        const email = 'jean.paul@pix.fr';
        // act
        const query = subject.get_user_id_from_email(email);
        // assert
        expect(query).to.equal(`SELECT id FROM users WHERE email = '${email}'`);
      });
    });

    describe('#find_assessment_ids_from_user_id', () => {
      it('should return the correct query', () => {
        // arrange
        const user_id = 123;
        // act
        const query = subject.find_assessment_ids_from_user_id(user_id);
        // assert
        expect(query).to.equal(`SELECT id FROM assessments WHERE "userId" = '${user_id}'`);
      });
    });

    describe('#delete_feedbacks_from_assessment_ids', () => {
      it('should return the correct query', () => {
        // arrange
        const assessment_ids = [123];
        // act
        const query = subject.delete_feedbacks_from_assessment_ids(assessment_ids);
        // assert
        expect(query).to.equal('DELETE FROM feedbacks WHERE "assessmentId" IN (123)');
      });

      it('should return the correct query with comma as separator when many assessment ids', () => {
        // arrange
        const assessment_ids = [123, 456];
        // act
        const query = subject.delete_feedbacks_from_assessment_ids(assessment_ids);
        // assert
        expect(query).to.equal('DELETE FROM feedbacks WHERE "assessmentId" IN (123,456)');
      });

      it('should return neutral query when assessmentIds is an empty array', () => {
        // arrange
        const assessment_ids = [];
        // act
        expect(() => subject.delete_feedbacks_from_assessment_ids(assessment_ids)).to.throw(Error);
      });
    });

    describe('#delete_skills_from_assessment_ids', () => {
      it('should return the correct query', () => {
        // arrange
        const assessment_ids = [123];
        // act
        const query = subject.delete_skills_from_assessment_ids(assessment_ids);
        // assert
        expect(query).to.equal('DELETE FROM skills WHERE "assessmentId" IN (123)');
      });

      it('should return the correct query with comma as separator when many assessment ids', () => {
        // arrange
        const assessment_ids = [123, 456];
        // act
        const query = subject.delete_skills_from_assessment_ids(assessment_ids);
        // assert
        expect(query).to.equal('DELETE FROM skills WHERE "assessmentId" IN (123,456)');
      });

      it('should return neutral query when assessmentIds is an empty array', () => {
        // arrange
        const assessment_ids = [];
        // act
        expect(() => subject.delete_skills_from_assessment_ids(assessment_ids)).to.throw(Error);
        // assert
      });
    });

    describe('#delete_answers_from_assessment_ids', () => {
      it('should return the correct query', () => {
        // arrange
        const assessment_ids = [123];
        // act
        const query = subject.delete_answers_from_assessment_ids(assessment_ids);
        // assert
        expect(query).to.equal('DELETE FROM answers WHERE "assessmentId" IN (123)');
      });

      it('should return the correct query with comma as separator when many assessment ids', () => {
        // arrange
        const assessment_ids = [123, 456];
        // act
        const query = subject.delete_answers_from_assessment_ids(assessment_ids);
        // assert
        expect(query).to.equal('DELETE FROM answers WHERE "assessmentId" IN (123,456)');
      });

      it('should return neutral query when assessmentIds is an empty array', () => {
        // arrange
        const assessment_ids = [];
        // act
        expect(() => subject.delete_answers_from_assessment_ids(assessment_ids)).to.throw(Error);
      });
    });

    describe('#delete_assessment_ids_from_user_id', () => {
      it('should return the correct query', () => {
        // arrange
        const user_id = 123;
        // act
        const query = subject.delete_assessments_from_user_id(user_id);
        // assert
        expect(query).to.equal(`DELETE FROM assessments WHERE "userId" = '${user_id}'`);
      });
    });
    describe('#delete_user_from_user_id', () => {
      it('should return the correct query', () => {
        // arrange
        const user_id = 123;
        // act
        const query = subject.delete_user_from_user_id(user_id);
        // assert
        expect(query).to.equal(`DELETE FROM users WHERE "id" = '${user_id}'`);
      });
    });

  });

  describe('ClientQueryAdapter', () => {
    let subject;

    beforeEach(() => {
      subject = new ClientQueryAdapter();
    });

    describe('#unpack_user_id', () => {
      it('should return the user id from result object', () => {
        // arrange
        const queryResult = { rows: [
          { id: 1 }
        ] };
        // act
        const result = subject.unpack_user_id(queryResult);
        // assert
        expect(result).to.equal(1);
      });

      it('should throw when result has no rows', () => {
        // arrange
        const queryResult = {
          rows: []
        };
        // act
        expect(() => subject.unpack_user_id(queryResult)).to.throw(Error);
      });
    });

    describe('#unpack_assessment_ids', () => {
      it('should return the assessment ids from result object', () => {
        // arrange
        const queryResult = {
          rows: [
            { id: 1 },
            { id: 2 },
            { id: 3 }
          ]
        };
        // act
        const result = subject.unpack_assessment_ids(queryResult);
        // assert
        expect(result).to.deep.equal([1, 2, 3]);
      });

      it('should return empty array when result has no rows', () => {
        // arrange
        const queryResult = {
          rows: []
        };
        // act
        const result = subject.unpack_assessment_ids(queryResult);
        // assert
        expect(result).to.be.empty;
      });

    });
  });
}
