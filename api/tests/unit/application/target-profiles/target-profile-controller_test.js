const { expect, sinon, hFake } = require('../../../test-helper');
const targetProfileController = require('../../../../lib/application/target-profiles/target-profile-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | target-profile-controller', () => {

  describe('#updateTargetProfileName', () => {

    let request;

    beforeEach(() => {

      sinon.stub(usecases, 'updateTargetProfileName');

      request = {
        params: {
          id: 123,
        },
        payload: {
          data: {
            attributes: {
              name: 'Pixer123',
            },
          },
        },
      };
    });

    context('successful case', () => {

      it('should succeed', async () => {
        // when
        const response = await targetProfileController.updateTargetProfileName(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('should update target profile name', async () => {
        // when
        await targetProfileController.updateTargetProfileName(request, hFake);

        // then
        expect(usecases.updateTargetProfileName).to.have.been.calledOnce;
        expect(usecases.updateTargetProfileName).to.have.been.calledWithMatch({ id: 123, name: 'Pixer123' });
      });
    });
  });

  describe('#attachOrganizations', () => {
    let request;

    beforeEach(() => {
      sinon.stub(usecases, 'attachOrganizationsToTargetProfile');

      request = {
        params: {
          id: 123,
        },
        payload: {
          'organization-ids': 1,
        },
      };
    });

    context('successful case', () => {

      it('should succeed', async () => {
        // when
        const response = await targetProfileController.attachOrganizations(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('should call usecase', async () => {
        // when
        await targetProfileController.attachOrganizations(request, hFake);

        // then
        expect(usecases.attachOrganizationsToTargetProfile).to.have.been.calledOnce;
        expect(usecases.attachOrganizationsToTargetProfile).to.have.been.calledWithMatch({ targetProfileId: 123, organizationIds: 1 });
      });
    });
  });

  describe('#attachOrganizationsFromExistingTargetProfile', () => {
    let request;

    beforeEach(() => {
      sinon.stub(usecases, 'attachOrganizationsFromExistingTargetProfile');

      request = {
        params: {
          id: 123,
        },
        payload: {
          'target-profile-id': 1,
        },
      };
    });

    context('successful case', () => {

      it('should succeed', async () => {
        // when
        const response = await targetProfileController.attachOrganizationsFromExistingTargetProfile(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('should call usecase', async () => {
        // when
        await targetProfileController.attachOrganizationsFromExistingTargetProfile(request, hFake);

        // then
        expect(usecases.attachOrganizationsFromExistingTargetProfile).to.have.been.calledOnce;
        expect(usecases.attachOrganizationsFromExistingTargetProfile).to.have.been.calledWithMatch({ targetProfileId: 123, existingTargetProfileId: 1 });
      });
    });
  });

  describe('#outdateTargetProfile', () => {

    let request;

    beforeEach(() => {

      sinon.stub(usecases, 'outdateTargetProfile');

      request = {
        params: {
          id: 123,
        },
      };
    });

    context('successful case', () => {

      it('should succeed', async () => {
        // when
        const response = await targetProfileController.outdateTargetProfile(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('should outdate target profile', async () => {
        // when
        await targetProfileController.outdateTargetProfile(request, hFake);

        // then
        expect(usecases.outdateTargetProfile).to.have.been.calledWithMatch({ id: 123 });
      });
    });
  });
});
