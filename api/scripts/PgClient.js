const { Client } = require('pg');

class PgClient {
  constructor(databaseUrl) {
    this.client = new Client(databaseUrl);
    this.client.connect();
  }

  end() {
    this.client.end();
  }

  query_and_log(query) {
    console.log(`query: ${query}`);
    return this.client.query(query)
      .then((result) => {
        const { command, rowCount, rows } = result;
        console.log(`result: command ${command} (rowCount ${rowCount}) = ${JSON.stringify(rows)}`);
        return result;
      });
  }
}

module.exports = PgClient;
