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

  mockLists({
    areas,
    competences,
    tubes,
    skills,
    challenges,
    courses,
    tutorials,
  }) {
    this.mockList({ tableName: 'Domaines' })
      .returns(areas)
      .activate();
    this.mockList({ tableName: 'Competences' })
      .returns(competences)
      .activate();
    this.mockList({ tableName: 'Tubes' })
      .returns(tubes)
      .activate();
    this.mockList({ tableName: 'Acquis' })
      .returns(skills)
      .activate();
    this.mockList({ tableName: 'Epreuves' })
      .returns(challenges)
      .activate();
    this.mockList({ tableName: 'Tests' })
      .returns(courses)
      .activate();
    this.mockList({ tableName: 'Tutoriels' })
      .returns(tutorials)
      .activate();
  }

};
