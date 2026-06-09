import sinon from 'sinon';

import { userAdminController } from '../../../../../src/identity-access-management/application/user/user.admin.controller.js';
import { QUERY_TYPES } from '../../../../../src/identity-access-management/domain/constants/user-query.js';
import { User } from '../../../../../src/identity-access-management/domain/models/User.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Identity Access Management | Application | Controller | Admin | User', function () {
  describe('#findPaginatedFilteredUsers', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'findPaginatedFilteredUsers');
    });

    it('returns a list of JSON API users fetched from the data repository', async function () {
      // given
      const request = { query: {} };
      usecases.findPaginatedFilteredUsers.resolves({ models: [], pagination: {} });

      // when
      const result = await userAdminController.findPaginatedFilteredUsers(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledOnce;
      expect(result.data.length).to.equal(0);
    });

    it('returns a JSON API response with pagination information', async function () {
      // given
      const request = { query: {} };
      const models = [new User({ id: 1 }), new User({ id: 2 }), new User({ id: 3 })];
      const pagination = { page: 2, pageSize: 25, itemsCount: 100, pagesCount: 4 };
      usecases.findPaginatedFilteredUsers.resolves({ models, pagination });

      // when
      const result = await userAdminController.findPaginatedFilteredUsers(request, hFake);

      // then
      const userIds = result.data.map((data) => data.id);
      expect(userIds).to.deep.equal(['1', '2', '3']);
      expect(result.meta).to.deep.equal({ itemsCount: 100, page: 2, pageSize: 25, pagesCount: 4 });
    });

    it('allows to filter users by first name', async function () {
      // given
      const query = { filter: { firstName: 'Alexia' }, page: {}, queryType: QUERY_TYPES.CONTAINS };
      const request = { query };
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });

      // when
      await userAdminController.findPaginatedFilteredUsers(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledWithMatch(query);
    });

    it('allows to filter users by last name', async function () {
      // given
      const query = { filter: { lastName: 'Granjean' }, page: {}, queryType: QUERY_TYPES.CONTAINS };
      const request = { query };
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });

      // when
      await userAdminController.findPaginatedFilteredUsers(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledWithMatch(query);
    });

    it('allows to filter users by email', async function () {
      // given
      const query = { filter: { email: 'alexiagranjean' }, page: {}, queryType: QUERY_TYPES.CONTAINS };
      const request = { query };
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });

      // when
      await userAdminController.findPaginatedFilteredUsers(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledWithMatch(query);
    });

    it('allows to paginate on a given page and page size', async function () {
      // given
      const query = {
        filter: { email: 'alexiagranjean' },
        page: { number: 2, size: 25 },
        queryType: QUERY_TYPES.CONTAINS,
      };
      const request = { query };
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });

      // when
      await userAdminController.findPaginatedFilteredUsers(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledWithMatch(query);
    });
  });
});
