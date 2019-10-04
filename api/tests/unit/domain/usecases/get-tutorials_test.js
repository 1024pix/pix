const { sinon, expect, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const getTutorials = require('../../../../lib/domain/usecases/get-tutorials');

describe('Unit | UseCase | get-tutorials', () => {

  let authenticatedUserId;
  let competenceId;
  let scorecardId;
  let parseIdStub;
  let knowledgeElementRepository;
  let skillRepository;

  beforeEach(() => {
    scorecardId = '1_recabC123';
    competenceId = 'recABc123';
    authenticatedUserId = 1;
    parseIdStub = sinon.stub(Scorecard, 'parseId');
    knowledgeElementRepository = { findUniqByUserIdAndCompetenceId: sinon.stub() };
    skillRepository = { findByCompetenceId: sinon.stub() };
  });

  afterEach(() => {
    sinon.restore();
  });

  context('When user is authenticated', () => {

    beforeEach(() => {
      parseIdStub.withArgs(scorecardId).returns({ competenceId, userId: authenticatedUserId });
    });

    context('And user asks for his own tutorials', () => {

      it('should resolve', () => {
        // given
        knowledgeElementRepository.findUniqByUserIdAndCompetenceId.resolves({});

        // when
        const result = getTutorials({
          authenticatedUserId,
          scorecardId,
          knowledgeElementRepository,
        });

        // then
        return expect(result).to.be.fulfilled;
      });

      context('when there is at least one invalidated knowledge element', () => {
        it('should return the user tutorials related to the scorecard', async () => {
          // given
          const skill_1 = domainBuilder.buildSkill({ name: '@wikipédia1' });
          const skill_2 = domainBuilder.buildSkill({ name: '@wikipédia2' });
          const skill_3 = domainBuilder.buildSkill({ name: '@wikipédia3' });
          const skill_4 = domainBuilder.buildSkill({ name: '@url1' });
          const skill_5 = domainBuilder.buildSkill({ name: '@url2' });
          const skill_6 = domainBuilder.buildSkill({ name: '@recherche1' });
          const skill_7 = domainBuilder.buildSkill({ name: '@recherche2' });
          const skill_8 = domainBuilder.buildSkill({ name: '@recherche3' });

          const knowledgeElementList = [
            domainBuilder.buildKnowledgeElement({ skillId: skill_3.id, competenceId: skill_3.competenceId, status: KnowledgeElement.StatusType.INVALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: skill_2.id, competenceId: skill_2.competenceId, status: KnowledgeElement.StatusType.INVALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: skill_1.id, competenceId: skill_1.competenceId, status: KnowledgeElement.StatusType.VALIDATED }),

            domainBuilder.buildKnowledgeElement({ skillId: skill_4.id, competenceId: skill_4.competenceId, status: KnowledgeElement.StatusType.VALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: skill_5.id, competenceId: skill_5.competenceId, status: KnowledgeElement.StatusType.VALIDATED }),

            domainBuilder.buildKnowledgeElement({ skillId: skill_7.id, competenceId: skill_7.competenceId, status: KnowledgeElement.StatusType.INVALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: skill_6.id, competenceId: skill_6.competenceId, status: KnowledgeElement.StatusType.INVALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: skill_8.id, competenceId: skill_8.competenceId, status: KnowledgeElement.StatusType.INVALIDATED }),
          ];

          knowledgeElementRepository.findUniqByUserIdAndCompetenceId.resolves(knowledgeElementList);
          skillRepository.findByCompetenceId.withArgs(skill_1.competenceId).returns(skill_1);
          skillRepository.findByCompetenceId.withArgs(skill_2.competenceId).returns(skill_2);
          skillRepository.findByCompetenceId.withArgs(skill_3.competenceId).returns(skill_3);
          skillRepository.findByCompetenceId.withArgs(skill_4.competenceId).returns(skill_4);
          skillRepository.findByCompetenceId.withArgs(skill_5.competenceId).returns(skill_5);
          skillRepository.findByCompetenceId.withArgs(skill_6.competenceId).returns(skill_6);
          skillRepository.findByCompetenceId.withArgs(skill_7.competenceId).returns(skill_7);
          skillRepository.findByCompetenceId.withArgs(skill_8.competenceId).returns(skill_8);

          // when
          const result = await getTutorials({
            authenticatedUserId,
            scorecardId,
            knowledgeElementRepository,
            skillRepository,
          });

          //then
          expect(result).to.deep.equal({});
        });
      });

      context('when there is no invalidated knowledge element', () => {
        it('should return no tutorials', async () => {
          // given
          const skill_1 = domainBuilder.buildSkill({ name: '@wikipédia1' });
          const skill_2 = domainBuilder.buildSkill({ name: '@wikipédia2' });
          const skill_3 = domainBuilder.buildSkill({ name: '@wikipédia3' });

          const knowledgeElementList = [
            domainBuilder.buildKnowledgeElement({ skillId: skill_3.id, competenceId: skill_3.competenceId, status: KnowledgeElement.StatusType.VALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: skill_2.id, competenceId: skill_2.competenceId, status: KnowledgeElement.StatusType.VALIDATED }),
            domainBuilder.buildKnowledgeElement({ skillId: skill_1.id, competenceId: skill_1.competenceId, status: KnowledgeElement.StatusType.VALIDATED }),
          ];

          knowledgeElementRepository.findUniqByUserIdAndCompetenceId.resolves(knowledgeElementList);
          skillRepository.findByCompetenceId.withArgs(skill_1.competenceId).returns(skill_1);
          skillRepository.findByCompetenceId.withArgs(skill_2.competenceId).returns(skill_2);
          skillRepository.findByCompetenceId.withArgs(skill_3.competenceId).returns(skill_3);

          // when
          const result = await getTutorials({
            authenticatedUserId,
            scorecardId,
            knowledgeElementRepository,
            skillRepository,
          });

          //then
          expect(skillRepository.findByCompetenceId).to.not.have.been.called;
          expect(result).to.deep.equal({});
        });
      });

    });

    context('And user asks for a scorecard that do not belongs to him', () => {
      it('should reject a "UserNotAuthorizedToAccessEntity" domain error', () => {
        // given
        const unauthorizedUserId = 42;

        // when
        const promise = getTutorials({
          authenticatedUserId: unauthorizedUserId,
          scorecardId,
        });

        // then
        return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
      });
    });
  });
});
