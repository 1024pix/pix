const { expect, databaseBuilder } = require('../../../test-helper');
const bookshelfToDomainConverter = require('../../../../lib/infrastructure/utils/bookshelf-to-domain-converter');

const User = require('../../../../lib/domain/models/User');
const Membership = require('../../../../lib/domain/models/Membership');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

const BookshelfUser = require('../../../../lib/infrastructure/data/user');
const BookshelfCampaign = require('../../../../lib/infrastructure/data/campaign');
const BookshelfCampaignParticipation = require('../../../../lib/infrastructure/data/campaign-participation');
const BookshelfAssessment = require('../../../../lib/infrastructure/data/assessment');

describe('Integration | Infrastructure | Utils | Bookshelf to domain converter', function() {

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  describe('buildDomainObject', () => {
    it('should convert a Bookshelf object into a domain object', async () => {
      // given
      databaseBuilder.factory.buildUser({ id: 1 });
      await databaseBuilder.commit();
      const bookshelfObject = await BookshelfUser.where({ id: 1 }).fetch();

      // when
      const domainObject = bookshelfToDomainConverter.buildDomainObject(BookshelfUser, bookshelfObject);

      // then
      expect(domainObject).to.be.an.instanceOf(User);
    });
    it('should populate the domain object with the matching Bookshelf properties', async () => {
      // given
      databaseBuilder.factory.buildUser({ id: 1 });
      await databaseBuilder.commit();
      const bookshelfObject = await BookshelfUser.where({ id: 1 }).fetch();

      // when
      const domainObject = bookshelfToDomainConverter.buildDomainObject(BookshelfUser, bookshelfObject);

      // then
      for (const property of ['firstName', 'lastName', 'email']) {
        expect(domainObject[property]).to.exist;
      }
    });
    it('should honor the domain object constructor', async () => {
      // given
      databaseBuilder.factory.buildUser({ id: 1 });
      await databaseBuilder.commit();
      const bookshelfObject = await BookshelfUser.where({ id: 1 }).fetch();

      // when
      const domainObject = bookshelfToDomainConverter.buildDomainObject(BookshelfUser, bookshelfObject);

      // then
      expect(domainObject.scorecards).to.deep.equal([]);

    });
    it('should support has-one relationships', async () => {
      // given
      databaseBuilder.factory.buildUser({ id: 1 });
      databaseBuilder.factory.buildAssessment({ id: 1, userId: 1 });
      databaseBuilder.factory.buildCampaignParticipation({ id: 1, assessmentId: 1, userId: 1 });
      await databaseBuilder.commit();
      const bookshelfObject = await BookshelfAssessment.where({ id: 1 }).fetch({
        withRelated: ['campaignParticipation'],
      });

      // when
      const domainObject = bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, bookshelfObject);

      // then
      expect(domainObject.campaignParticipation).to.be.instanceOf(CampaignParticipation);
    });
    it('should support has-many relationships', async () => {
      // given
      databaseBuilder.factory.buildUser({ id: 1 });
      databaseBuilder.factory.buildMembership({ id: 1, userId: 1 });
      databaseBuilder.factory.buildMembership({ id: 2, userId: 1 });
      await databaseBuilder.commit();
      const bookshelfObject = await BookshelfUser.where({ id: 1 }).fetch({
        withRelated: ['memberships'],
      });

      // when
      const domainObject = bookshelfToDomainConverter.buildDomainObject(BookshelfUser, bookshelfObject);

      // then
      expect(domainObject.memberships).to.be.instanceOf(Array);
      expect(domainObject.memberships[0]).to.be.instanceOf(Membership);
    });
    it('should support belongs-to relationships', async () => {
      //given
      databaseBuilder.factory.buildCampaign({ id: 1 });
      await databaseBuilder.commit();
      const bookshelfObject = await BookshelfCampaign.where({ id: 1 }).fetch({
        withRelated: ['targetProfile'],
      });

      // when
      const domainObject = bookshelfToDomainConverter.buildDomainObject(BookshelfCampaign, bookshelfObject);

      // then
      expect(domainObject.targetProfile).to.be.instanceOf(TargetProfile);
    });
    it('should support domain object relationship’s name not matching the corresponding Bookshelf class name', async () => {
      // given
      databaseBuilder.factory.buildUser({ id: 1 });
      databaseBuilder.factory.buildKnowledgeElement({ userId: 1 });
      databaseBuilder.factory.buildKnowledgeElement({ userId: 1 });
      await databaseBuilder.commit();
      const bookshelfObject = await BookshelfUser.where({ id: 1 }).fetch({
        withRelated: 'knowledgeElements'
      });

      // when
      const domainObject = bookshelfToDomainConverter.buildDomainObject(BookshelfUser, bookshelfObject);

      // then
      expect(domainObject.knowledgeElements).to.be.instanceOf(Array);
      expect(domainObject.knowledgeElements[0]).to.be.instanceOf(KnowledgeElement);
    });
    it('should support nested relationships', async () => {
      // given
      databaseBuilder.factory.buildCampaign({ id: 1 });
      databaseBuilder.factory.buildUser({ id: 1 });
      databaseBuilder.factory.buildCampaignParticipation({ id: 1, campaignId: 1, userId: 1 });
      databaseBuilder.factory.buildKnowledgeElement({ id: 1, userId: 1 });
      databaseBuilder.factory.buildKnowledgeElement({ id: 2, userId: 1 });
      await databaseBuilder.commit();
      const bookshelfObject = await BookshelfCampaignParticipation.where({ id: 1 }).fetch({
        withRelated: ['user.knowledgeElements'],
      });

      // when
      const domainObject = bookshelfToDomainConverter.buildDomainObject(BookshelfCampaignParticipation, bookshelfObject);

      // then
      expect(domainObject.user.knowledgeElements).to.be.instanceOf(Array);
      expect(domainObject.user.knowledgeElements[0]).to.be.instanceOf(KnowledgeElement);
    });
  });
});
