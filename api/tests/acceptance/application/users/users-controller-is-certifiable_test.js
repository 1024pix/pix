const {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
  mockLearningContent,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const { PIX_EMPLOI_CLEA_V1 } = require('../../../../lib/domain/models/Badge').keys;

describe('Acceptance | users-controller-is-certifiable', function () {
  let server;
  let options;
  let user;

  const learningContent = {
    areas: [
      {
        id: 'recvoGdo7z2z7pXWa',
        titleFrFr: 'Information et données',
        color: 'jaffa',
        code: '1',
        competenceIds: ['recCompetence1', 'recCompetence2', 'recCompetence3'],
      },
      {
        id: 'recDH19F7kKrfL3Ii',
        titleFrFr: 'Communication et collaboration',
        color: 'jaffa',
        code: '1',
        competenceIds: ['recCompetence4', 'recCompetence5'],
      },
    ],
    competences: [
      {
        id: 'recCompetence1',
        nameFrFr: 'Mener une recherche et une veille d’information',
        index: '1.1',
        origin: 'Pix',
        areaId: 'recvoGdo7z2z7pXWa',
      },
      {
        id: 'recCompetence2',
        nameFrFr: 'Gérer les données',
        index: '1.2',
        origin: 'Pix',
        areaId: 'recvoGdo7z2z7pXWa',
      },
      {
        id: 'recCompetence3',
        nameFrFr: 'Traiter les données',
        index: '1.3',
        origin: 'Pix',
        areaId: 'recvoGdo7z2z7pXWa',
      },
      {
        id: 'recCompetence4',
        nameFrFr: 'Intéragir',
        index: '2.1',
        origin: 'Pix',
        areaId: 'recDH19F7kKrfL3Ii',
      },
      {
        id: 'recCompetence5',
        nameFrFr: 'Partager et publier',
        index: '2.2',
        origin: 'Pix',
        areaId: 'recDH19F7kKrfL3Ii',
      },
    ],
    skills: [
      {
        id: 'skillId@web3',
        name: '@web3',
        status: 'actif',
        competenceId: 'recCompetence1',
      },
      {
        id: 'skillId@fichier3',
        name: '@fichier3',
        status: 'actif',
        competenceId: 'recCompetence2',
      },
      {
        id: 'skillId@tri3',
        name: '@tri3',
        status: 'actif',
        competenceId: 'recCompetence3',
      },
      {
        id: 'skillId@spam3',
        name: '@spam3',
        status: 'actif',
        competenceId: 'recCompetence4',
      },
      {
        id: 'skillId@vocRS3',
        name: '@vocRS3',
        status: 'actif',
        competenceId: 'recCompetence5',
      },
    ],
  };

  beforeEach(async function () {
    // create server
    server = await createServer();

    user = databaseBuilder.factory.buildUser();

    mockLearningContent(learningContent);

    learningContent.skills.forEach(({ id: skillId, competenceId }) => {
      databaseBuilder.factory.buildKnowledgeElement({ userId: user.id, earnedPix: 10, competenceId, skillId });
    });

    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    learningContent.skills.forEach(({ id: skillId }) => {
      databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId,
        skillId,
      });
    });

    const cleaBadgeId = databaseBuilder.factory.buildBadge({
      key: PIX_EMPLOI_CLEA_V1,
      targetProfileId,
    }).id;
    const skillSetId = databaseBuilder.factory.buildSkillSet({
      targetProfileId,
      badgeId: cleaBadgeId,
      skillIds: `{${learningContent.skills.map(({ id }) => id).join(',')}}`,
    }).id;
    databaseBuilder.factory.buildBadgeCriterion({
      badgeId: cleaBadgeId,
      threshold: 75,
      skillSetIds: `{${skillSetId}}`,
    });

    databaseBuilder.factory.buildBadgeAcquisition({
      userId: user.id,
      badgeId: cleaBadgeId,
    });

    options = {
      method: 'GET',
      url: `/api/users/${user.id}/is-certifiable`,
      payload: {},
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    return databaseBuilder.commit();
  });

  describe('GET /users/:id/is-certifiable', function () {
    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const otherUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      it('should return a 200 status code response with JSON API serialized isCertifiable', async function () {
        // given
        const expectedResponse = {
          data: {
            id: `${user.id}`,
            type: 'isCertifiables',
            attributes: {
              'is-certifiable': true,
              'eligible-complementary-certifications': ['CléA Numérique'],
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedResponse);
      });
    });
  });
});
