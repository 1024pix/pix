const { airtableBuilder, databaseBuilder, expect, knex, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const faker = require('faker');
const cache = require('../../../../lib/infrastructure/caches/cache');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-user-scorecard', () => {

  let options;
  let server;

  beforeEach(async () => {
    options = {
      method: 'GET',
      url: '/api/users/1234/scorecard',
      payload: {},
      headers: { authorization: generateValidRequestAuhorizationHeader() },
    };
    server = await createServer();
  });

  let knowledgeElementsWanted;
  let assessmentId;

  const skillWeb1Id = 'recAcquisWeb1';
  const skillWeb1Name = '@web1';
  const skillWeb1 = airtableBuilder.factory.buildSkill({
    id: skillWeb1Id,
    nom: skillWeb1Name,
  });

  const skillWeb2Id = 'recAcquisWeb2';
  const skillWeb2Name = '@web2';
  const skillWeb2 = airtableBuilder.factory.buildSkill({
    id: skillWeb2Id,
    nom: skillWeb2Name,
  });

  const skillWeb3Id = 'recAcquisWeb3';
  const skillWeb3Name = '@web3';
  const skillWeb3 = airtableBuilder.factory.buildSkill({
    id: skillWeb3Id,
    nom: skillWeb3Name,
  });

  const competenceId = 'recCompetence';
  const competenceReference = '1.1 Mener une recherche et une veille d’information';
  const competence = airtableBuilder.factory.buildCompetence({
    id: competenceId,
    epreuves: [],
    titre: 'Mener une recherche et une veille d’information',
    tests: [],
    acquisIdentifiants: [skillWeb1Id],
    tubes: [],
    acquisViaTubes: [skillWeb1Id],
    reference: competenceReference,
    testsRecordID: [],
    acquis: [skillWeb1Name],
  });

  describe('GET /users/:id/scorecard', () => {

    const userToInsert = {
      id: 1234,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: 'A124B2C3#!',
      cgu: true,
      pixOrgaTermsOfServiceAccepted: false,
      pixCertifTermsOfServiceAccepted: false
    };

    beforeEach(async () => {
      airtableBuilder.mockGet({ tableName: 'Competences' })
        .returns(competence)
        .activate();

      airtableBuilder.mockList({ tableName: 'Acquis' })
        .returns([skillWeb1, skillWeb2, skillWeb3])
        .activate();

      airtableBuilder.mockGet({ tableName: 'Acquis' })
        .returns(skillWeb1)
        .activate();

      airtableBuilder.mockGet({ tableName: 'Acquis' })
        .returns(skillWeb2)
        .activate();

      airtableBuilder.mockGet({ tableName: 'Acquis' })
        .returns(skillWeb3)
        .activate();

      assessmentId = databaseBuilder.factory.buildAssessment().id;
      const answer1Id = databaseBuilder.factory.buildAnswer({ assessmentId }).id;

      knowledgeElementsWanted = [
        databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
          userId: 1234,
          competenceId: competence.id,
          assessmentId,
          answerId: answer1Id,
          createdAt: ''
        }),
      ];

      await databaseBuilder.commit();
    });

    afterEach(() => {
      airtableBuilder.cleanAll();

      return knex('users').delete();
    });

    after(() => {
      cache.flushAll();
    });

    it('should return 200', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        //expect(response.result).to.deep.equal(expectedUserJSONApi);
      });

    });

  });

});
