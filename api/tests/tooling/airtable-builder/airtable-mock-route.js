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
    const { url, query } = generateUrlForRouteType({
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
      .query(query ? query : this.query)
      .reply(200, body);
  }
}

AirtableMockRoute.ROUTE_TYPE = ROUTE_TYPE;

module.exports = AirtableMockRoute;

function generateUrlForRouteType({ routeType, tableName, returnBody }) {
  const url = `/v0/test-base/${tableName}`;
  const returnBodyId = returnBody && returnBody.fields && returnBody.fields['id persistant'];

  if (!returnBodyId && routeType === ROUTE_TYPE.GET) {
    throw new Error('get route should have a return object with an id a its root');
  }

  const query = routeType === ROUTE_TYPE.GET && { filterByFormula: `{id persistant}="${returnBodyId}"` };
  return { url, query };
}

function generateBodyForRouteType({ returnBody, routeType }) {
  switch (routeType) {

    case ROUTE_TYPE.LIST:
      return { records: returnBody };

    case ROUTE_TYPE.GET:
      return { records: [returnBody] };
  }
}
