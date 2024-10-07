import { userAdminController } from '../../../../../src/identity-access-management/application/user/user.admin.controller.js';
import { User } from '../../../../../src/identity-access-management/domain/models/User.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Application | Controller | Admin | User', function () {
  describe('#findPaginatedFilteredUsers', function () {
    let dependencies;

    beforeEach(function () {
      sinon.stub(usecases, 'findPaginatedFilteredUsers');
      const userForAdminSerializer = { serialize: sinon.stub() };
      dependencies = {
        userForAdminSerializer,
      };
    });

    it('returns a list of JSON API users fetched from the data repository', async function () {
      // given
      const request = { query: {} };
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });
      dependencies.userForAdminSerializer.serialize.returns({ data: {}, meta: {} });

      // when
      await userAdminController.findPaginatedFilteredUsers(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledOnce;
      expect(dependencies.userForAdminSerializer.serialize).to.have.been.calledOnce;
    });

    it('returns a JSON API response with pagination information', async function () {
      // given
      const request = { query: {} };
      const expectedResults = [new User({ id: 1 }), new User({ id: 2 }), new User({ id: 3 })];
      const expectedPagination = { page: 2, pageSize: 25, itemsCount: 100, pagesCount: 4 };
      usecases.findPaginatedFilteredUsers.resolves({ models: expectedResults, pagination: expectedPagination });

      // when
      await userAdminController.findPaginatedFilteredUsers(request, hFake, dependencies);

      // then
      expect(dependencies.userForAdminSerializer.serialize).to.have.been.calledWithExactly(
        expectedResults,
        expectedPagination,
      );
    });

    it('allows to filter users by first name', async function () {
      // given
      const query = { filter: { firstName: 'Alexia' }, page: {} };
      const request = { query };
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });

      // when
      await userAdminController.findPaginatedFilteredUsers(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledWithMatch(query);
    });

    it('allows to filter users by last name', async function () {
      // given
      const query = { filter: { lastName: 'Granjean' }, page: {} };
      const request = { query };
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });

      // when
      await userAdminController.findPaginatedFilteredUsers(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledWithMatch(query);
    });

    it('allows to filter users by email', async function () {
      // given
      const query = { filter: { email: 'alexiagranjean' }, page: {} };
      const request = { query };
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });

      // when
      await userAdminController.findPaginatedFilteredUsers(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledWithMatch(query);
    });

    it('allows to paginate on a given page and page size', async function () {
      // given
      const query = { filter: { email: 'alexiagranjean' }, page: { number: 2, size: 25 } };
      const request = { query };
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });

      // when
      await userAdminController.findPaginatedFilteredUsers(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledWithMatch(query);
    });
  });

  describe('#updateUserDetailsByAdmin', function () {
    const userId = 1132;
    const newEmail = 'partiel@update.com';
    let dependencies;

    beforeEach(function () {
      sinon.stub(usecases, 'updateUserDetailsByAdmin');
      const userDetailsForAdminSerializer = { serializeForUpdate: sinon.stub(), deserialize: sinon.stub() };
      dependencies = { userDetailsForAdminSerializer };
    });

    it('updates email, firstName, lastName', async function () {
      // given
      const userDetails = { email: newEmail, lastName: 'newLastName', firstName: 'newFirstName' };
      const payload = { data: { attributes: userDetails } };
      const request = {
        auth: { credentials: { userId: 'adminId' } },
        params: { id: userId },
        payload,
      };

      dependencies.userDetailsForAdminSerializer.deserialize.withArgs(payload).returns(userDetails);
      usecases.updateUserDetailsByAdmin.withArgs({ ...userDetails, updatedByAdminId: 'adminId' }).resolves();
      dependencies.userDetailsForAdminSerializer.serializeForUpdate.returns('updated');

      // when
      const response = await userAdminController.updateUserDetailsByAdmin(request, hFake, dependencies);

      // then
      expect(response).to.be.equal('updated');
    });

    it('updates email only', async function () {
      // given
      const payload = {
        data: {
          attributes: {
            email: newEmail,
          },
        },
      };
      const request = {
        auth: { credentials: { userId: 'adminId' } },
        params: {
          id: userId,
        },
        payload,
      };

      dependencies.userDetailsForAdminSerializer.deserialize.withArgs(payload).returns({ email: newEmail });
      usecases.updateUserDetailsByAdmin.resolves({ email: newEmail });
      dependencies.userDetailsForAdminSerializer.serializeForUpdate.returns(newEmail);

      // when
      const response = await userAdminController.updateUserDetailsByAdmin(request, hFake, dependencies);

      // then
      expect(response).to.be.equal(newEmail);
    });
  });
});
