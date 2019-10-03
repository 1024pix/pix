const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const { NotFoundError, InternalError, UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | retrieve-campaign-information', () => {

  let campaignRepoStub;
  let orgaRepoStub;
  let studentRepoStub;
  const organizationId = 'organizationId';
  const organization = { id: organizationId, logoUrl: 'a logo url' };
  const campaign = { id: 'campaignId', organizationId };
  const campaignCode = 'QWERTY123';
  const augmentedCampaign = Object.assign({}, campaign, { organizationLogoUrl: organization.logoUrl });
  const user = { id: 1, firstName: 'John', lastName: 'Snow' };

  beforeEach(() => {
    campaignRepoStub = sinon.stub(campaignRepository, 'getByCode');
    orgaRepoStub = sinon.stub(organizationRepository, 'get').resolves(organization);
    studentRepoStub = sinon.stub(studentRepository, 'checkIfUserIsPartOfStudentListInOrganization');
    sinon.stub(userRepository, 'get').withArgs(user.id).resolves(user);
  });

  afterEach(() => {
    sinon.restore();
  });

  context('the campaign does not exist', async () => {

    it('should throw a NotFound error', async () => {
      // given
      campaignRepoStub.resolves(null);

      // when
      try {
        await usecases.retrieveCampaignInformation({ code: campaignCode, userId: user.id });
      }

      // then
      catch (error) {
        expect(error).to.be.instanceOf(NotFoundError);
      }
    });
  });

  context('the campaign exists', () => {

    beforeEach(() => {
      campaignRepoStub.resolves(campaign);
    });

    it('should return the campaign ', async () => {
      // when
      const result = await usecases.retrieveCampaignInformation({ code: campaignCode, userId: user.id });

      // then
      expect(campaignRepository.getByCode).to.have.been.calledWithExactly(campaignCode);
      expect(result).to.deep.equal(campaign);
    });

    context('The related organization does not exist', () => {

      beforeEach(() => {
        orgaRepoStub.resolves(null);
      });

      it('should throw an Internal Error', async () => {
        // when
        try {
          await usecases.retrieveCampaignInformation({ code: campaignCode, userId: user.id });
        }

        // then
        catch (error) {
          return expect(error).to.be.an instanceof (InternalError);
        }
      });
    });

    context('The related organization exist', () => {

      it('should return the same campaign with adding the organization logo url', async () => {
        // given
        orgaRepoStub.resolves(organization);

        // when
        const campaignRes = await usecases.retrieveCampaignInformation({ code: campaignCode, userId: user.id });

        // then
        expect(campaignRes).to.be.deep.equal(augmentedCampaign);
      });

      context('Organization of the campaign is managing student', () => {

        beforeEach(() => {
          orgaRepoStub.resolves(Object.assign(organization, { isManagingStudents: true }));
        });

        it('should call checkIfUserIsPartOfStudentListInOrganization from student repository', async () => {
          // given
          studentRepoStub.resolves(true);

          // when
          await usecases.retrieveCampaignInformation({ code: campaignCode, userId: user.id });

          // then
          return expect(studentRepository.checkIfUserIsPartOfStudentListInOrganization).to.have.been.called;
        });

        it('should resolve if user is part of the organization student list', async () => {
          // given
          studentRepoStub.resolves(true);

          // when
          const promise = usecases.retrieveCampaignInformation({ code: campaignCode, userId: user.id });

          // then
          return expect(promise).to.be.fulfilled;
        });

        it('should throw an error if user is not authorized to access ressource', () => {
          // given
          studentRepoStub.resolves(false);

          // when
          const promise = usecases.retrieveCampaignInformation({ code: campaignCode, userId: user.id });

          // then
          return expect(promise).to.be.rejected.then((error) => {
            expect(error).to.be.an.instanceOf(UserNotAuthorizedToAccessEntity);
          });
        });
      });

      context('Organization of the campaign is not managing student', () => {

        beforeEach(() => {
          orgaRepoStub.resolves(Object.assign(organization, { isManagingStudents: false }));
        });

        it('should not called checkIfUserIsPartOfStudentListInOrganization method', async () => {
          // when
          await usecases.retrieveCampaignInformation({ code: campaignCode, userId: user.id });

          // then
          return expect(studentRepository.checkIfUserIsPartOfStudentListInOrganization).to.not.have.been.called;
        });

        it('should return an error because organization is not managing students', async () => {
          // when
          const promise = usecases.retrieveCampaignInformation({ code: campaignCode, userId: user.id });

          // then
          return expect(promise).to.be.fulfilled;
        });
      });
    });
  });
});
