const factory = require('./factory/index');
const AirtableMockRoute = require('./airtable-mock-route');

module.exports = class AirtableBuilder {
  constructor({ nock }) {
    this.nockScope = nock('https://api.airtable.com').persist();
    this.nock = nock;
    this.routeMocks = [];
    this.factory = factory;
    this.ROUTE_TYPE = AirtableMockRoute.ROUTE_TYPE;
  }

  mockRoute({ routeType, tableName }) {

    const newMockRoute = new AirtableMockRoute({ routeType, tableName, nockScope: this.nockScope });
    this.routeMocks.push(newMockRoute);
    return newMockRoute;
  }

  cleanAll() {
    this.nock.cleanAll();
    this.routeMocks = [];
  }
};
