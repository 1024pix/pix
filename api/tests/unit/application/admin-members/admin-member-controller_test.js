const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');
const adminMemberController = require('../../../../lib/application/admin-members/admin-member-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | admin-members', function () {
  describe('#findAll', function () {
    it('should return serialized admin members', async function () {
      // given
      const member1 = domainBuilder.buildAdminMember.withRoleSuperAdmin({
        id: 10,
        firstName: 'Buffy',
        lastName: 'Summers',
        email: 'the-slayer@sunnydale.com',
        userId: 123,
      });
      const member2 = domainBuilder.buildAdminMember.withRoleMetier({
        id: 20,
        firstName: 'Rupert',
        lastName: 'Giles',
        email: 'the-watcher@london.com',
        userId: 456,
      });
      sinon.stub(usecases, 'getAdminMembers').resolves([member1, member2]);

      // when
      const response = await adminMemberController.findAll();

      // then
      expect(response.data).to.deep.equal([
        {
          type: 'admin-members',
          id: '10',
          attributes: {
            'first-name': 'Buffy',
            'last-name': 'Summers',
            email: 'the-slayer@sunnydale.com',
            role: 'SUPER_ADMIN',
            'user-id': 123,
            'is-super-admin': true,
            'is-certif': false,
            'is-metier': false,
            'is-support': false,
          },
        },
        {
          type: 'admin-members',
          id: '20',
          attributes: {
            'first-name': 'Rupert',
            'last-name': 'Giles',
            email: 'the-watcher@london.com',
            role: 'METIER',
            'user-id': 456,
            'is-super-admin': false,
            'is-certif': false,
            'is-metier': true,
            'is-support': false,
          },
        },
      ]);
    });
  });

  describe('#getCurrentAdminMember', function () {
    const request = {
      auth: { credentials: { userId: 123 } },
    };

    it('should return the serialized user admin member', async function () {
      // given
      const member = domainBuilder.buildAdminMember.withRoleSuperAdmin({
        id: 10,
        firstName: 'Buffy',
        lastName: 'Summers',
        email: 'the-slayer@sunnydale.com',
        userId: 123,
      });
      sinon.stub(usecases, 'getAdminMemberDetails').withArgs({ userId: 123 }).resolves(member);

      // when
      const response = await adminMemberController.getCurrentAdminMember(request);

      // then
      expect(response.data).to.deep.equal({
        type: 'admin-members',
        id: '10',
        attributes: {
          'first-name': 'Buffy',
          'last-name': 'Summers',
          email: 'the-slayer@sunnydale.com',
          role: 'SUPER_ADMIN',
          'user-id': 123,
          'is-super-admin': true,
          'is-certif': false,
          'is-metier': false,
          'is-support': false,
        },
      });
    });
  });

  describe('#updateAdminMember', function () {
    const request = {
      params: { id: 123 },
      payload: {
        data: {
          attributes: {
            role: 'SUPER_ADMIN',
          },
        },
      },
    };

    it('should call the usecase with the right command', async function () {
      // given
      const expectedCommand = {
        id: 123,
        role: 'SUPER_ADMIN',
      };
      sinon.stub(usecases, 'updateAdminMember').resolves(domainBuilder.buildAdminMember());

      // when
      await adminMemberController.updateAdminMember(request);

      // then
      expect(usecases.updateAdminMember).calledWithExactly(expectedCommand);
    });

    it('should return the updated serialized admin member', async function () {
      // given
      const member = domainBuilder.buildAdminMember.withRoleSuperAdmin({
        id: 10,
        firstName: 'Buffy',
        lastName: 'Summers',
        email: 'the-slayer@sunnydale.com',
        userId: 123,
      });
      sinon.stub(usecases, 'updateAdminMember').resolves(member);

      // when
      const response = await adminMemberController.updateAdminMember(request);

      // then
      expect(response.data).to.deep.equal({
        type: 'admin-members',
        id: '10',
        attributes: {
          'first-name': 'Buffy',
          'last-name': 'Summers',
          email: 'the-slayer@sunnydale.com',
          role: 'SUPER_ADMIN',
          'user-id': 123,
          'is-super-admin': true,
          'is-certif': false,
          'is-metier': false,
          'is-support': false,
        },
      });
    });
  });

  describe('#deactivateAdminMember', function () {
    const request = {
      params: { id: 123 },
    };

    it('should call the usecase with the right command', async function () {
      // given
      const expectedCommand = { id: 123 };
      sinon.stub(usecases, 'deactivateAdminMember').resolves();

      // when
      await adminMemberController.deactivateAdminMember(request, hFake);

      // then
      expect(usecases.deactivateAdminMember).calledWithExactly(expectedCommand);
    });

    it('should return a response with 204 code', async function () {
      // given
      sinon.stub(usecases, 'deactivateAdminMember').resolves();

      // when
      const response = await adminMemberController.deactivateAdminMember(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#saveAdminMember', function () {
    const request = {
      payload: {
        data: {
          attributes: {
            email: 'some_email@example.net',
            role: 'SUPER_ADMIN',
          },
        },
      },
    };

    it('should call the usecase with the right command', async function () {
      // given
      const expectedCommand = { email: 'some_email@example.net', role: 'SUPER_ADMIN' };
      sinon.stub(usecases, 'saveAdminMember').resolves(domainBuilder.buildAdminMember());

      // when
      await adminMemberController.saveAdminMember(request, hFake);

      // then
      expect(usecases.saveAdminMember).calledWithExactly(expectedCommand);
    });

    it('should return the created serialized admin member', async function () {
      // given
      const member = domainBuilder.buildAdminMember.withRoleSuperAdmin({
        id: 10,
        firstName: 'Buffy',
        lastName: 'Summers',
        email: 'some_email@example.net',
        userId: 123,
      });
      sinon.stub(usecases, 'saveAdminMember').resolves(member);

      // when
      const response = await adminMemberController.saveAdminMember(request, hFake);

      // then
      expect(response.source.data).to.deep.equal({
        type: 'admin-members',
        id: '10',
        attributes: {
          'first-name': 'Buffy',
          'last-name': 'Summers',
          email: 'some_email@example.net',
          role: 'SUPER_ADMIN',
          'user-id': 123,
          'is-super-admin': true,
          'is-certif': false,
          'is-metier': false,
          'is-support': false,
        },
      });
      expect(response.statusCode).to.equal(201);
    });
  });
});
