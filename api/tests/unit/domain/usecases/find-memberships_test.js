const { expect, sinon, factory } = require('../../../test-helper');
const findMemberships = require('../../../../lib/domain/usecases/find-memberships');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const Membership = require('../../../../lib/domain/models/Membership');

describe('Unit | UseCase | find-memberships', () => {

  beforeEach(() => {
    sinon.stub(membershipRepository, 'findByUserId');
  });

  afterEach(() => {
    membershipRepository.findByUserId.restore();
  });

  context('Green case', () => {

    it('should resolve an array of all User Memberships', async () => {
      // given
      const USER_ID = 123;
      membershipRepository.findByUserId.withArgs(USER_ID).resolves([factory.buildMembership(), factory.buildMembership()]);

      // when
      const actualMemberships = await findMemberships({ authenticatedUserId: USER_ID, requestedUserId: USER_ID, membershipRepository });

      // then
      expect(actualMemberships).to.have.lengthOf(2);
      expect(actualMemberships[0]).to.be.an.instanceOf(Membership);
    });
  });

  context('Red case', () => {

    it('should reject a UserNotAuthorizedToAccessEntity error when autenticated ID does not match requested user ID', () => {
      // given
      const authenticatedUserId = 111;
      const requestedUserId = 999;

      // when
      const promise = findMemberships({ authenticatedUserId, requestedUserId });

      // then
      return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
    });
  });
});
