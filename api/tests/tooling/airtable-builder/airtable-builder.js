const factory = require('./factory/index');
const AirtableMockRoute = require('./airtable-mock-route');

module.exports = class AirtableBuilder {
  constructor({ nock }) {
    this.nockScope = nock('https://api.airtable.com').persist();
    this.nock = nock;
    this.factory = factory;
    this.ROUTE_TYPE = AirtableMockRoute.ROUTE_TYPE;
  }

  mockRoute({ routeType, tableName }) {

    const newMockRoute = new AirtableMockRoute({ routeType, tableName, nockScope: this.nockScope });
    return newMockRoute;
  }

  mockGet({ tableName }) {
    return this.mockRoute({ routeType: this.ROUTE_TYPE.GET, tableName });
  }

  mockList({ tableName }) {
    return this.mockRoute({ routeType: this.ROUTE_TYPE.LIST, tableName });
  }

  cleanAll() {
    this.nock.cleanAll();
  }

};
