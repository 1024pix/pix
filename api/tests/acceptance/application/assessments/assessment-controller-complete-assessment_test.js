const { databaseBuilder, expect, generateValidRequestAuthorizationHeader, knex, airtableBuilder, sinon } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');
const createServer = require('../../../../server');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');

describe('Acceptance | Controller | assessment-controller-complete-assessment', () => {

  let options;
  let server;
  let user, assessment;
  let competencesAssociatedSkillsAndChallenges;

  before(() => {
    const learningContentForCertification = airtableBuilder.factory.buildLearningContentForCertification();
    airtableBuilder.mockList({ tableName: 'Domaines' })
      .returns([learningContentForCertification.area])
      .activate();
    airtableBuilder.mockList({ tableName: 'Competences' })
      .returns(learningContentForCertification.competences)
      .activate();
    airtableBuilder.mockList({ tableName: 'Acquis' })
      .returns(learningContentForCertification.skills)
      .activate();
    airtableBuilder.mockList({ tableName: 'Epreuves' })
      .returns(learningContentForCertification.challenges)
      .activate();
    competencesAssociatedSkillsAndChallenges = learningContentForCertification.competencesAssociatedSkillsAndChallenges;
  });

  after(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  beforeEach(async () => {
    server = await createServer();

    user = databaseBuilder.factory.buildUser({});
    assessment = databaseBuilder.factory.buildAssessment({
      userId: user.id, state: Assessment.states.STARTED
    });

    await databaseBuilder.commit();

    options = {
      method: 'PATCH',
      url: `/api/assessments/${assessment.id}/complete-assessment`,
      headers: {
        authorization: generateValidRequestAuthorizationHeader(user.id)
      },
    };
  });

  afterEach(async () => {
    await cache.flushAll();
    return knex('assessment-results').delete();
  });

  describe('PATCH /assessments/{id}/complete-assessment', () => {

    context('when user is not the owner of the assessment', () => {

      it('should return a 401 HTTP status code', async () => {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader(user.id + 1);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

    });

    context('when user is the owner of the assessment', () => {

      it('should complete the assessment', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('when assessment is of type certification', () => {
      let certifiableUserId;
      let certificationAssessmentId;

      beforeEach(() => {
        certifiableUserId = databaseBuilder.factory.buildCertifiableUser({ competencesAssociatedSkillsAndChallenges }).id;
        certificationAssessmentId = databaseBuilder.factory.buildAnsweredNotCompletedCertificationAssessment({
          certifiableUserId,
          competencesAssociatedSkillsAndChallenges,
        }).id;

        sinon.stub(badgeRepository, 'findOneByKey').resolves({ badgePartnerCompetences: [] });

        return databaseBuilder.commit();
      });

      it('should complete the certification assessment', async () => {
        // given
        options.url = `/api/assessments/${certificationAssessmentId}/complete-assessment`;
        options.headers.authorization = generateValidRequestAuthorizationHeader(certifiableUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
