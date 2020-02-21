const { domainBuilder, expect, sinon, catchErr } = require('../../../test-helper');
const { createUserOrgaSettings } = require('../../../../lib/domain/usecases');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const userOrgaSettingsRepository = require('../../../../lib/infrastructure/repositories/user-orga-settings-repository');
const {  NotFoundError, UserNotFoundError, UserOrgaSettingsCreationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-user-orga-settings', () => {

  let user;
  let organization;
  let userOrgaSettings;
  let getUserStub;
  let getOrganizationStub;
  let createUserOrgaSettingsStub;

  beforeEach(() => {
    organization = domainBuilder.buildOrganization();
    user = domainBuilder.buildUser();
    userOrgaSettings = domainBuilder.buildUserOrgaSettings({ organization, user });

    getUserStub = sinon.stub(userRepository, 'get');
    getOrganizationStub = sinon.stub(organizationRepository, 'get');
    createUserOrgaSettingsStub = sinon.stub(userOrgaSettingsRepository, 'create');
  });

  context('Green cases', () => {
    it('should create user-orga-settings', async () => {
      // given
      getUserStub.resolves();
      getOrganizationStub.resolves();
      createUserOrgaSettingsStub.resolves(userOrgaSettings);

      // when
      const result = await createUserOrgaSettings({ userOrgaSettings });

      // then
      expect(userRepository.get).to.be.calledOnce;
      expect(organizationRepository.get).to.be.calledOnce;
      expect(result.id).to.exist;
    });
  });

  context('Red cases', () => {

    it('should throw an error when user not found', async () => {
      // given
      getUserStub.rejects(new UserNotFoundError());

      // when
      const error = await catchErr(createUserOrgaSettings)({ userOrgaSettings });

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it('should throw an error when organization not found', async () => {
      // given
      getOrganizationStub.rejects(new NotFoundError());

      // when
      const error = await catchErr(createUserOrgaSettings)({ userOrgaSettings });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should throw an error when organization user information already exist', async () => {
      // given
      createUserOrgaSettingsStub.rejects(new UserOrgaSettingsCreationError());

      // when
      const error = await catchErr(createUserOrgaSettings)({ userOrgaSettings });

      // then
      expect(error).to.be.instanceOf(UserOrgaSettingsCreationError);
    });
  });
});
