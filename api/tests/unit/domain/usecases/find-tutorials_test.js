const { sinon, expect, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const findTutorials = require('../../../../lib/domain/usecases/find-tutorials');

describe('Unit | UseCase | find-tutorials', function() {

  let authenticatedUserId;
  let competenceId;
  let scorecardId;
  let parseIdStub;
  let knowledgeElementRepository;
  let skillRepository;
  let tubeRepository;
  let tutorialRepository;
  let userTutorialRepository;
  let locale;

  beforeEach(function() {
    scorecardId = '1_recabC123';
    competenceId = 'recABc123';
    authenticatedUserId = 1;
    parseIdStub = sinon.stub(Scorecard, 'parseId');
    knowledgeElementRepository = { findUniqByUserIdAndCompetenceId: sinon.stub() };
    skillRepository = { findActiveByCompetenceId: sinon.stub() };
    tubeRepository = { findByNames: sinon.stub() };
    tutorialRepository = { findByRecordIdsForCurrentUser: sinon.stub() };
    locale = 'lang-country';
  });

  afterEach(function() {
    sinon.restore();
  });

  context('When user is authenticated', function() {

    beforeEach(function() {
      parseIdStub.withArgs(scorecardId).returns({ competenceId, userId: authenticatedUserId });
    });

    context('And user asks for tutorials belonging to his scorecard', function() {

      it('should resolve', function() {
        // given
        knowledgeElementRepository.findUniqByUserIdAndCompetenceId.resolves({});

        // when
        const result = findTutorials({
          authenticatedUserId,
          scorecardId,
          knowledgeElementRepository,
          skillRepository,
          tubeRepository,
          tutorialRepository,
          locale,
        });

        // then
        return expect(result).to.be.fulfilled;
      });

      context('when there is at least one invalidated knowledge element and two inferred knowledge element', function() {
        let expectedTutorialList;

        beforeEach(async function() {
          // given
          const userTutorial = { id: 1, userId: 'userId', tutorialId: 'tuto1' };
          const tutorial1 = domainBuilder.buildTutorial({ id: 'tuto1' });
          const tutorial2 = domainBuilder.buildTutorial({ id: 'tuto2' });
          tutorial2.userTutorial = userTutorial;
          const tutorial3 = domainBuilder.buildTutorial({ id: 'tuto3' });

          const inferredTutorial = domainBuilder.buildTutorial({ id: 'tutoInferred' });

          const expectedTutorial1 = {
            ...tutorial1,
            tubeName: '@wikipédia',
            tubePracticalTitle: 'Practical Title wikipédia',
            tubePracticalDescription: 'Practical Description wikipédia',
          };

          const expectedTutorial2 = {
            ...tutorial2,
            tubeName: '@wikipédia',
            tubePracticalTitle: 'Practical Title wikipédia',
            tubePracticalDescription: 'Practical Description wikipédia',
            userTutorial,
          };

          const expectedTutorial3 = {
            ...tutorial3,
            tubeName: '@recherche',
            tubePracticalTitle: 'Practical Title recherche',
            tubePracticalDescription: 'Practical Description recherche',
          };

          expectedTutorialList = [
            expectedTutorial3,
            expectedTutorial1,
            expectedTutorial2,
          ];

          const tutorialIdList1 = [tutorial1.id, tutorial2.id];
          const tutorialIdList2 = [tutorial3.id];

          const inferredTutorialIdList = [inferredTutorial.id];

          tutorialRepository.findByRecordIdsForCurrentUser.withArgs({ ids: tutorialIdList1, userId: authenticatedUserId, locale }).returns([tutorial1, tutorial2]);
          tutorialRepository.findByRecordIdsForCurrentUser.withArgs({ ids: tutorialIdList2, userId: authenticatedUserId, locale }).returns([tutorial3]);

          tutorialRepository.findByRecordIdsForCurrentUser.withArgs({ ids: inferredTutorialIdList, userId: authenticatedUserId }).returns([inferredTutorial]);

          const skill_1 = domainBuilder.buildSkill({ name: '@wikipédia1', tutorialIds: tutorialIdList1, competenceId: competenceId });
          const skill_2 = domainBuilder.buildSkill({ name: '@wikipédia2', tutorialIds: tutorialIdList1, competenceId: competenceId });
          const skill_3 = domainBuilder.buildSkill({ name: '@wikipédia3', tutorialIds: tutorialIdList1, competenceId: competenceId });
          const skill_4 = domainBuilder.buildSkill({ name: '@url1', competenceId: competenceId });
          const skill_5 = domainBuilder.buildSkill({ name: '@url2', competenceId: competenceId });
          const skill_6 = domainBuilder.buildSkill({ name: '@recherche1', tutorialIds: inferredTutorialIdList, competenceId: competenceId });
          const skill_7 = domainBuilder.buildSkill({ name: '@recherche2', tutorialIds: inferredTutorialIdList, competenceId: competenceId });
          const skill_8 = domainBuilder.buildSkill({ name: '@recherche3', tutorialIds: tutorialIdList2, competenceId: competenceId });

          const knowledgeElementList = [
            domainBuilder.buildKnowledgeElement({ skillId: skill_3.id, competenceId: skill_3.competenceId, status: KnowledgeElement.StatusType.INVALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: skill_2.id, competenceId: skill_2.competenceId, status: KnowledgeElement.StatusType.INVALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: skill_1.id, competenceId: skill_1.competenceId, status: KnowledgeElement.StatusType.VALIDATED }),

            domainBuilder.buildKnowledgeElement({ skillId: skill_4.id, competenceId: skill_4.competenceId, status: KnowledgeElement.StatusType.VALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: skill_5.id, competenceId: skill_5.competenceId, status: KnowledgeElement.StatusType.VALIDATED }),

            domainBuilder.buildKnowledgeElement({
              skillId: skill_7.id,
              competenceId: skill_7.competenceId,
              status: KnowledgeElement.StatusType.INVALIDATED,
              source: KnowledgeElement.SourceType.INFERRED,
            }),

            domainBuilder.buildKnowledgeElement({
              skillId: skill_6.id,
              competenceId: skill_6.competenceId,
              status: KnowledgeElement.StatusType.INVALIDATED,
              source: KnowledgeElement.SourceType.INFERRED,
            }),

            domainBuilder.buildKnowledgeElement({ skillId: skill_8.id, competenceId: skill_8.competenceId, status: KnowledgeElement.StatusType.INVALIDATED }),
          ];

          knowledgeElementRepository.findUniqByUserIdAndCompetenceId.resolves(knowledgeElementList);

          skillRepository.findActiveByCompetenceId.withArgs(competenceId).returns([skill_1, skill_2, skill_3, skill_4, skill_5, skill_6, skill_7, skill_8]);

          const tubeNames = ['@wikipédia', '@recherche'];
          const tubeList = [
            domainBuilder.buildTube({
              name: tubeNames[0],
              practicalTitle: 'Practical Title wikipédia',
              practicalDescription: 'Practical Description wikipédia',
            }),
            domainBuilder.buildTube({
              name: tubeNames[1],
              practicalTitle: 'Practical Title recherche',
              practicalDescription: 'Practical Description recherche',
            }),
          ];

          tubeRepository.findByNames.withArgs({ tubeNames, locale }).returns(tubeList);
        });

        it('should return the tutorials related to the scorecard', async function() {
          // when
          const result = await findTutorials({
            authenticatedUserId,
            scorecardId,
            knowledgeElementRepository,
            skillRepository,
            tubeRepository,
            tutorialRepository,
            locale,
          });

          //then
          expect(result).to.deep.equal(expectedTutorialList);
        });

      });

      context('when there is no invalidated knowledge element', function() {
        it('should return no tutorial', async function() {
          // given
          const competenceId = 'recCompetenceWikipedia';
          const skill_1 = domainBuilder.buildSkill({ name: '@wikipédia1', competenceId: competenceId });
          const skill_2 = domainBuilder.buildSkill({ name: '@wikipédia2', competenceId: competenceId });

          const knowledgeElementList = [
            domainBuilder.buildKnowledgeElement({ skillId: skill_2.id, competenceId: skill_2.competenceId, status: KnowledgeElement.StatusType.VALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: skill_1.id, competenceId: skill_1.competenceId, status: KnowledgeElement.StatusType.VALIDATED }),
          ];

          knowledgeElementRepository.findUniqByUserIdAndCompetenceId.resolves(knowledgeElementList);
          skillRepository.findActiveByCompetenceId.withArgs(competenceId).returns([skill_1, skill_2]);

          // when
          const result = await findTutorials({
            authenticatedUserId,
            scorecardId,
            knowledgeElementRepository,
            skillRepository,
            tubeRepository,
            tutorialRepository,
            userTutorialRepository,
          });

          //then
          expect(skillRepository.findActiveByCompetenceId).to.not.have.been.called;
          expect(result).to.deep.equal([]);
        });
      });

    });

    context('And user asks for a scorecard that do not belongs to him', function() {
      it('should reject a "UserNotAuthorizedToAccessEntityError" domain error', function() {
        // given
        const unauthorizedUserId = 42;

        // when
        const promise = findTutorials({
          authenticatedUserId: unauthorizedUserId,
          scorecardId,
          knowledgeElementRepository,
          skillRepository,
          tubeRepository,
          tutorialRepository,
          userTutorialRepository,
        });

        // then
        return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntityError);
      });
    });
  });
});
