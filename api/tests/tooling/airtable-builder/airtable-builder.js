const factory = require('./factory/index');

module.exports = class AirtableBuilder {
  constructor({ nock }) {
    this.nockScope = nock('https://api.airtable.com');
    this.nock = nock;
    this.routeMocks = [];
    this.factory = factory;
  }

  mockRoute({ routeType, tableName }) {

    const newMockRoute = new AirtableMockRoute({ routeType, tableName, nockScope: this.nockScope });
    this.routeMocks.push(newMockRoute);
    return newMockRoute;
  }

  cleanAll() {
    this.nock.cleanAll();
  }
};

class AirtableMockRoute {

  constructor({ routeType, tableName, nockScope }) {
    this.routeType = routeType;
    this.tableName = tableName;
    this.nockScope = nockScope;
    this.returnBody = undefined;
  }

  returns(returnBody) {
    this.returnBody = returnBody;
    return this;
  }

  activate() {
    const url = generateUrlForRouteType({
      routeType: this.routeType,
      tableName: this.tableName,
      returnBody: this.returnBody,
    });

    this.nockScope
      .get(url)
      .query(true)
      .reply(200, this.returnBody);
  }
}

function generateUrlForRouteType({ routeType, tableName, returnBody }) {
  let url = '/v0/test-base/';
  const returnBodyId = returnBody ? returnBody.id : undefined;

  switch (routeType) {

    case 'list':
      url += tableName;
      return url;

    case 'get':
      if (!returnBodyId) {
        throw new Error('get route should have a return object with an id a its root');
      }
      url += `${tableName}/${returnBodyId}`;
      return url;
  }
}
