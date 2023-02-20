import { Client } from 'pg';

class PgClient {
  constructor(databaseUrl) {
    this.client = new Client({ connectionString: databaseUrl, connectionTimeoutMillis: 10000 });
  }

  static async getClient(databaseUrl) {
    const instance = new PgClient(databaseUrl);
    try {
      await instance.client.connect();
    } catch (error) {
      console.error('Database error', error);
    }
    return instance;
  }

  end() {
    return this.client.end();
  }

  query_and_log(query) {
    console.log(`query: ${query}`);
    return this.client.query(query).then((result) => {
      const { command, rowCount, rows } = result;
      console.log(`result: command ${command} (rowCount ${rowCount}) = ${JSON.stringify(rows)}`);
      return result;
    });
  }
}

export default PgClient;
