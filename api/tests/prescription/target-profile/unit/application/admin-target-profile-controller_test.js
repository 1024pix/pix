import { targetProfileController } from '../../../../../src/prescription/target-profile/application/admin-target-profile-controller.js';
import { usecases } from '../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | admin-target-profile-controller', function () {
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now: new Date('2022-02-01'), toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#attachOrganizations', function () {
    let request;
    let targetProfileAttachOrganizationSerializer;

    beforeEach(function () {
      sinon.stub(usecases, 'attachOrganizationsToTargetProfile');
      targetProfileAttachOrganizationSerializer = { serialize: sinon.stub() };

      request = {
        params: {
          id: 123,
        },
        payload: {
          'organization-ids': 1,
        },
      };
    });

    context('successful case', function () {
      it('should succeed', async function () {
        // when
        const serializer = Symbol('targetProfileAttachOrganizationsSerializer');
        usecases.attachOrganizationsToTargetProfile.resolves();
        targetProfileAttachOrganizationSerializer.serialize.returns(serializer);

        const response = await targetProfileController.attachOrganizations(request, hFake, {
          targetProfileAttachOrganizationSerializer,
        });
        // then
        expect(targetProfileAttachOrganizationSerializer.serialize).to.have.been.called;
        expect(response.statusCode).to.equal(200);
        expect(response.source).to.equal(serializer);
      });

      it('should call usecase', async function () {
        // when
        await targetProfileController.attachOrganizations(request, hFake, {
          targetProfileAttachOrganizationSerializer,
        });

        // then
        expect(usecases.attachOrganizationsToTargetProfile).to.have.been.calledOnce;
        expect(usecases.attachOrganizationsToTargetProfile).to.have.been.calledWithMatch({
          targetProfileId: 123,
          organizationIds: 1,
        });
      });
    });
  });

  describe('#attachOrganizationsFromExistingTargetProfile', function () {
    let request;

    beforeEach(function () {
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

    context('successful case', function () {
      it('should succeed', async function () {
        // when
        const response = await targetProfileController.attachOrganizationsFromExistingTargetProfile(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('should call usecase', async function () {
        // when
        await targetProfileController.attachOrganizationsFromExistingTargetProfile(request, hFake);

        // then
        expect(usecases.attachOrganizationsFromExistingTargetProfile).to.have.been.calledOnce;
        expect(usecases.attachOrganizationsFromExistingTargetProfile).to.have.been.calledWithMatch({
          targetProfileId: 123,
          existingTargetProfileId: 1,
        });
      });
    });
  });

  describe('#getContentAsJsonFile', function () {
    it('should succeed', async function () {
      // given
      sinon.stub(usecases, 'getTargetProfileContentAsJson');
      usecases.getTargetProfileContentAsJson.withArgs({ targetProfileId: 123 }).resolves({
        jsonContent: 'json_content',
        targetProfileName: 'target_profile_name',
      });
      const request = {
        params: {
          id: 123,
        },
      };

      // when
      const response = await targetProfileController.getContentAsJsonFile(request, hFake);

      // then
      expect(response.source).to.equal('json_content');
      expect(response.headers).to.deep.equal({
        'Content-Type': 'application/json;charset=utf-8',
        'Content-Disposition': 'attachment; filename=20220201_profil_cible_target_profile_name.json',
      });
    });
  });

  describe('#getLearningContentAsPdf', function () {
    it('should return the pdf', async function () {
      // given
      const learningContent = domainBuilder.buildLearningContent();
      const pdfBuffer = 'some_pdf_buffer';
      const docTitle = 'titre_du_doc';
      sinon
        .stub(usecases, 'getLearningContentByTargetProfile')
        .withArgs({ targetProfileId: 123, language: 'fr' })
        .resolves({ learningContent, targetProfileName: docTitle });

      const learningContentPDFPresenter = {
        present: sinon.stub(),
      };

      learningContentPDFPresenter.present.withArgs(learningContent, docTitle, 'fr').resolves(pdfBuffer);
      const request = {
        params: {
          id: 123,
          locale: 'fr',
        },
        query: {
          language: 'fr',
        },
      };

      // when
      const response = await targetProfileController.getLearningContentAsPdf(request, hFake, {
        learningContentPDFPresenter,
      });

      // then
      expect(response.headers['Content-Disposition']).to.equal(
        `attachment; filename=20220201_profil_cible_${docTitle}.pdf`,
      );
      expect(response.headers['Content-Type']).to.equal('application/pdf');
      expect(response.source).to.equal(pdfBuffer);
    });
  });

  describe('#attachTargetProfiles', function () {
    let request;

    it('should succeed', async function () {
      // given
      sinon.stub(usecases, 'attachTargetProfilesToOrganization');
      request = {
        params: {
          organizationId: 123,
        },
        payload: {
          'target-profile-ids': [1, 2],
        },
      };
      usecases.attachTargetProfilesToOrganization.resolves();

      // when
      const response = await targetProfileController.attachTargetProfiles(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
      expect(usecases.attachTargetProfilesToOrganization).to.have.been.calledWithExactly({
        organizationId: 123,
        targetProfileIds: [1, 2],
      });
    });
  });

  describe('#detachOrganizations', function () {
    it('should call the detachOrganizationsFromTargetProfile use-case', async function () {
      // given
      const expectedResult = Symbol('result');
      const organizationIds = Symbol('organizationIds');
      const detachedOrganizationIds = Symbol('detachedOrganizationIds');
      const connectedUserId = 1;
      const payload = { data: { 'organization-ids': [1, 2, 3] } };
      const request = {
        auth: { credentials: { userId: connectedUserId } },
        deserializedPayload: { organizationIds },
        params: { targetProfileId: 1 },
        payload,
        i18n: {
          __: sinon.stub(),
        },
      };

      sinon.stub(usecases, 'detachOrganizationsFromTargetProfile');
      usecases.detachOrganizationsFromTargetProfile
        .withArgs({ targetProfileId: 1, organizationIds })
        .resolves(detachedOrganizationIds);

      const targetProfileDetachOrganizationsSerializer = { serialize: sinon.stub() };
      targetProfileDetachOrganizationsSerializer.serialize
        .withArgs({ targetProfileId: 1, detachedOrganizationIds })
        .returns(expectedResult);

      const dependencies = { targetProfileDetachOrganizationsSerializer };

      // when
      const response = await targetProfileController.detachOrganizations(request, hFake, dependencies);

      // then
      expect(response.source).to.equal(expectedResult);
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#outdateTargetProfile', function () {
    let request;

    beforeEach(function () {
      sinon.stub(usecases, 'outdateTargetProfile');

      request = {
        params: {
          id: 123,
        },
      };
    });

    context('successful case', function () {
      it('should succeed', async function () {
        // when
        const response = await targetProfileController.outdateTargetProfile(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('should outdate target profile', async function () {
        // when
        await targetProfileController.outdateTargetProfile(request, hFake);

        // then
        expect(usecases.outdateTargetProfile).to.have.been.calledWithMatch({ id: 123 });
      });
    });
  });
});
