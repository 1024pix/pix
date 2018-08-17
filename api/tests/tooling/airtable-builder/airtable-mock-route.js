const ROUTE_TYPE = {
  GET: 'get',
  LIST: 'list',
};

class AirtableMockRoute {

  constructor({ routeType, tableName, nockScope }) {
    this.routeType = routeType;
    this.tableName = tableName;
    this.nockScope = nockScope;
    this.returnBody = undefined;
    this.query = true;
  }

  respondsToQuery(query) {
    this.query = query;
    return this;
  }

  returns(returnBody) {
    this.returnBody = returnBody;
    return this;
  }

  activate() {
    const url = generateUrlForRouteType({
      returnBody: this.returnBody,
      routeType: this.routeType,
      tableName: this.tableName,
    });

    const body = generateBodyForRouteType({
      returnBody: this.returnBody,
      routeType: this.routeType,
    });

    this.nockScope
      .get(url)
      .query(this.query)
      .reply(200, body);
  }
}

AirtableMockRoute.ROUTE_TYPE = ROUTE_TYPE;

module.exports = AirtableMockRoute;

function generateUrlForRouteType({ routeType, tableName, returnBody }) {
  let url = '/v0/test-base/';
  const returnBodyId = returnBody ? returnBody.id : undefined;

  switch (routeType) {

    case ROUTE_TYPE.LIST:
      url += tableName;
      return url;

    case ROUTE_TYPE.GET:
      if (!returnBodyId) {
        throw new Error('get route should have a return object with an id a its root');
      }
      url += `${tableName}/${returnBodyId}`;
      return url;
  }
}

function generateBodyForRouteType({ returnBody, routeType }) {
  switch (routeType) {

    case ROUTE_TYPE.LIST:
      return { records: returnBody };

    case ROUTE_TYPE.GET:
      return returnBody;
  }
}
