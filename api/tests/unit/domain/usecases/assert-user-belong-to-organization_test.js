const { expect, sinon } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const usecases = require('../../../../lib/domain/usecases');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | assert-user-to-organization', () => {

  const organizationId = 'organizationId';
  const campaign = { id: 'campaignId', organizationId };
  const user = { id: 1, firstName: 'John', lastName: 'Snow' };

  context('Organization of the campaign is managing student', () => {

    let studentRepoStub;
    const organization = { id: organizationId, isManagingStudents: true };

    beforeEach(() => {
      sinon.stub(organizationRepository, 'get').withArgs(organizationId).resolves(organization);
      studentRepoStub = sinon.stub(studentRepository, 'checkIfUserIsPartOfStudentListInOrganization');
      sinon.stub(userRepository, 'get').withArgs(user.id).resolves(user);
    });

    it('should call checkIfUserIsPartOfStudentListInOrganization from student repository', async () => {
      // given
      studentRepoStub.resolves(true);

      // when
      await usecases.assertUserBelongToOrganization({ userId: user.id, campaign });

      // then
      return expect(studentRepository.checkIfUserIsPartOfStudentListInOrganization).to.have.been.called;
    });

    it('should resolve if user is part of the organization student list', async () => {
      // given
      studentRepoStub.resolves(true);

      // when
      const promise = usecases.assertUserBelongToOrganization({ userId: user.id, campaign });

      // then
      return expect(promise).to.be.fulfilled;
    });

    it('should throw an error if user is not authorized to access ressource', () => {
      // given
      studentRepoStub.resolves(false);

      // when
      const promise = usecases.assertUserBelongToOrganization({ userId: user.id, campaign });

      // then
      return expect(promise).to.be.rejected.then((error) => {
        expect(error).to.be.an.instanceOf(UserNotAuthorizedToAccessEntity);
      });
    });
  });

  context('Organization of the campaign is not managing student', () => {

    const organization = { id: organizationId, isManagingStudents: false };

    beforeEach(() => {
      sinon.stub(organizationRepository, 'get').withArgs(organizationId).resolves(organization);
      sinon.stub(studentRepository, 'checkIfUserIsPartOfStudentListInOrganization');
      sinon.stub(userRepository, 'get').withArgs(user.id).resolves(user);
    });

    it('should not called checkIfUserIsPartOfStudentListInOrganization method', async () => {
      // when
      await usecases.assertUserBelongToOrganization({ userId: user.id, campaign });

      // then
      return expect(studentRepository.checkIfUserIsPartOfStudentListInOrganization).to.not.have.been.called;
    });

    it('should return an error because organization is not managing students', async () => {
      // when
      const promise = usecases.assertUserBelongToOrganization({ userId: user.id, campaign });

      // then
      return expect(promise).to.be.fulfilled;
    });
  });
});
