const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const certificationCenterMembershipSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-center-membership-serializer');
const certificationCenterInvitationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-center-invitation-serializer');
const sessionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/session-serializer');
const Session = require('../../../../lib/domain/models/Session');

const certificationCenterController = require('../../../../lib/application/certification-centers/certification-center-controller');
const csvHelpers = require('../../../../scripts/helpers/csvHelpers');

describe('Unit | Controller | certifications-center-controller', function () {
  describe('#saveSession', function () {
    let request;
    let expectedSession;
    const userId = 274939274;
    beforeEach(function () {
      expectedSession = new Session({
        certificationCenter: 'Université de dressage de loutres',
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-12-08',
        time: '14:30',
        description: 'ahah',
        accessCode: 'ABCD12',
      });

      sinon.stub(usecases, 'createSession').resolves();
      sinon.stub(sessionSerializer, 'deserialize').returns(expectedSession);
      sinon.stub(sessionSerializer, 'serialize');

      request = {
        payload: {
          data: {
            type: 'sessions',
            attributes: {
              'certification-center': 'Université de dressage de loutres',
              address: 'Nice',
              room: '28D',
              examiner: 'Antoine Toutvenant',
              date: '2017-12-08',
              time: '14:30',
              description: 'ahah',
            },
          },
        },
        auth: {
          credentials: {
            userId,
          },
        },
      };
    });

    it('should save the session', async function () {
      // when
      await certificationCenterController.saveSession(request, hFake);

      // then
      expect(usecases.createSession).to.have.been.calledWith({ userId, session: expectedSession });
    });

    it('should return the saved session in JSON API', async function () {
      // given
      const jsonApiSession = {
        data: {
          type: 'sessions',
          id: 12,
          attributes: {},
        },
      };
      const savedSession = new Session({
        id: '12',
        certificationCenter: 'Université de dressage de loutres',
      });

      usecases.createSession.resolves(savedSession);
      sessionSerializer.serialize.returns(jsonApiSession);

      // when
      const response = await certificationCenterController.saveSession(request, hFake);

      // then
      expect(response).to.deep.equal(jsonApiSession);
      expect(sessionSerializer.serialize).to.have.been.calledWith({ session: savedSession });
    });
  });

  describe('#getStudents', function () {
    it('should return a paginated serialized list of students', async function () {
      // given
      const student = domainBuilder.buildOrganizationLearner({ division: '3A' });

      const request = {
        auth: {
          credentials: { userId: '111' },
        },
        params: {
          certificationCenterId: 99,
          sessionId: 88,
        },
        query: { 'page[size]': 10, 'page[number]': 1, 'filter[divisions][]': '3A' },
      };

      sinon
        .stub(usecases, 'findStudentsForEnrollment')
        .withArgs({
          certificationCenterId: 99,
          sessionId: 88,
          page: { size: 10, number: 1 },
          filter: { divisions: ['3A'] },
        })
        .resolves({
          data: [student],
          pagination: { page: 1, pageSize: 10, rowCount: 1, pageCount: 1 },
        });

      // when
      const response = await certificationCenterController.getStudents(request, hFake);

      // then
      expect(response).to.deep.equal({
        data: [
          {
            attributes: {
              birthdate: student.birthdate,
              division: student.division,
              'first-name': student.firstName,
              'last-name': student.lastName,
            },
            id: `${student.id}`,
            type: 'students',
          },
        ],
        meta: { page: 1, pageSize: 10, rowCount: 1, pageCount: 1 },
      });
    });
  });

  describe('#getDivisions', function () {
    it('Should return a serialized list of divisions', async function () {
      // given
      const request = {
        auth: {
          credentials: { userId: 111 },
        },
        params: {
          certificationCenterId: 99,
        },
      };

      sinon
        .stub(usecases, 'findDivisionsByCertificationCenter')
        .withArgs({ certificationCenterId: 99 })
        .resolves([{ name: '3A' }, { name: '3B' }, { name: '4C' }]);

      // when
      const response = await certificationCenterController.getDivisions(request, hFake);

      // then
      expect(response).to.deep.equal({
        data: [
          {
            type: 'divisions',
            id: '3A',
            attributes: {
              name: '3A',
            },
          },
          {
            type: 'divisions',
            id: '3B',
            attributes: {
              name: '3B',
            },
          },
          {
            type: 'divisions',
            id: '4C',
            attributes: {
              name: '4C',
            },
          },
        ],
      });
    });
  });

  describe('#findCertificationCenterMembershipsByCertificationCenter', function () {
    const certificationCenterId = 1;

    const request = {
      params: {
        certificationCenterId,
      },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'findCertificationCenterMembershipsByCertificationCenter');
      sinon.stub(certificationCenterMembershipSerializer, 'serialize');
    });

    it('should call usecase and serializer and return ok', async function () {
      // given
      usecases.findCertificationCenterMembershipsByCertificationCenter
        .withArgs({
          certificationCenterId,
        })
        .resolves({});
      certificationCenterMembershipSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await certificationCenterController.findCertificationCenterMembershipsByCertificationCenter(
        request
      );

      // then
      expect(response).to.equal('ok');
    });
  });

  describe('#findCertificationCenterMemberships', function () {
    it('should return the serialized membership', async function () {
      // given
      const user = domainBuilder.buildUser();
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
        certificationCenter,
        user,
      });
      const serializedCertificationCenterMembership = Symbol('certification center membership serialized');

      const request = {
        params: {
          certificationCenterId: certificationCenter.id,
        },
      };

      sinon
        .stub(usecases, 'findCertificationCenterMembershipsByCertificationCenter')
        .withArgs({
          certificationCenterId: certificationCenter.id,
        })
        .resolves(certificationCenterMembership);

      sinon
        .stub(certificationCenterMembershipSerializer, 'serializeMembers')
        .withArgs(certificationCenterMembership)
        .returns(serializedCertificationCenterMembership);

      // when
      const response = await certificationCenterController.findCertificationCenterMemberships(request);

      // then
      expect(usecases.findCertificationCenterMembershipsByCertificationCenter).to.have.been.calledOnce;
      expect(response).equal(serializedCertificationCenterMembership);
    });
  });

  describe('#createCertificationCenterMembershipByEmail', function () {
    const certificationCenterId = 1;
    const email = 'user@example.net';

    const request = {
      params: { certificationCenterId },
      payload: { email },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'createCertificationCenterMembershipByEmail');
      sinon.stub(certificationCenterMembershipSerializer, 'serialize');

      usecases.createCertificationCenterMembershipByEmail.resolves();
      certificationCenterMembershipSerializer.serialize.returns('ok');
    });

    it('should call usecase and serializer and return 201 HTTP code', async function () {
      // when
      const response = await certificationCenterController.createCertificationCenterMembershipByEmail(request, hFake);

      // then
      expect(usecases.createCertificationCenterMembershipByEmail).calledWith({ certificationCenterId, email });
      expect(response.source).to.equal('ok');
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('#findPaginatedSessionSummaries', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'findPaginatedCertificationCenterSessionSummaries');
    });

    it('should return a list of JSON API session summaries with pagination information', async function () {
      // given
      const request = {
        params: { id: 456 },
        auth: { credentials: { userId: 123 } },
        query: {
          'page[number]': 1,
          'page[size]': 10,
        },
      };
      const sessionSummary = domainBuilder.buildSessionSummary.created({
        id: 1,
        address: 'ici',
        room: 'la-bas',
        date: '2020-01-01',
        time: '16:00',
        examiner: 'Moi',
        enrolledCandidatesCount: 5,
        effectiveCandidatesCount: 4,
      });
      usecases.findPaginatedCertificationCenterSessionSummaries
        .withArgs({
          userId: 123,
          certificationCenterId: 456,
          page: { number: 1, size: 10 },
        })
        .resolves({
          models: [sessionSummary],
          meta: { page: 1, pageSize: 10, itemsCount: 1, pagesCount: 1, hasSessions: true },
        });

      // when
      const serializedSessionSummaries = await certificationCenterController.findPaginatedSessionSummaries(
        request,
        hFake
      );

      // then
      expect(serializedSessionSummaries).to.deep.equal({
        data: [
          {
            id: '1',
            type: 'session-summaries',
            attributes: {
              address: 'ici',
              room: 'la-bas',
              date: '2020-01-01',
              time: '16:00',
              examiner: 'Moi',
              'effective-candidates-count': 4,
              'enrolled-candidates-count': 5,
              status: 'created',
            },
          },
        ],
        meta: {
          hasSessions: true,
          itemsCount: 1,
          page: 1,
          pageSize: 10,
          pagesCount: 1,
        },
      });
    });
  });

  describe('#updateReferer', function () {
    it('should call updateCertificationCenterReferer usecase and return 204', async function () {
      // given
      const request = {
        params: { certificationCenterId: 456 },
        payload: {
          data: {
            attributes: {
              isReferer: true,
              userId: 1234,
            },
          },
        },
      };

      sinon.stub(usecases, 'updateCertificationCenterReferer').resolves();

      // when
      const response = await certificationCenterController.updateReferer(request, hFake);

      // then
      expect(usecases.updateCertificationCenterReferer).calledWith({
        userId: 1234,
        certificationCenterId: 456,
        isReferer: true,
      });
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#sendInvitationForAdmin', function () {
    beforeEach(function () {
      sinon.stub(certificationCenterInvitationSerializer, 'deserializeForAdmin');
      sinon.stub(usecases, 'createOrUpdateCertificationCenterInvitationForAdmin');
      sinon.stub(certificationCenterInvitationSerializer, 'serializeForAdmin');
    });

    it('should return 201 HTTP status code with data if there isn’t an already pending invitation', async function () {
      // given
      const email = 'some.user@example.net';
      const language = 'fr-fr';
      const certificationCenterId = 7;
      const payload = {
        data: {
          type: 'certification-center-invitations',
          attributes: {
            email,
            language,
          },
        },
      };

      certificationCenterInvitationSerializer.deserializeForAdmin.withArgs(payload).resolves({
        email,
        language,
      });
      usecases.createOrUpdateCertificationCenterInvitationForAdmin
        .withArgs({
          email,
          locale: language,
          certificationCenterId,
        })
        .resolves({
          certificationCenterInvitation: 'an invitation',
          isInvitationCreated: true,
        });
      const serializedData = Symbol();
      certificationCenterInvitationSerializer.serializeForAdmin.withArgs('an invitation').returns(serializedData);

      // when
      const response = await certificationCenterController.sendInvitationForAdmin(
        {
          params: { certificationCenterId },
          payload,
        },
        hFake
      );

      // then
      expect(response.source).to.equal(serializedData);
      expect(response.statusCode).to.equal(201);
    });

    it('should return 200 HTTP status code with data if there is already a pending existing invitation', async function () {
      // given
      const email = 'some.user@example.net';
      const language = 'fr-fr';

      certificationCenterInvitationSerializer.deserializeForAdmin.resolves({ email, language });
      usecases.createOrUpdateCertificationCenterInvitationForAdmin.resolves({
        certificationCenterInvitation: 'an invitation',
        isInvitationCreated: false,
      });
      const serializedData = Symbol();
      certificationCenterInvitationSerializer.serializeForAdmin.returns(serializedData);

      // when
      const response = await certificationCenterController.sendInvitationForAdmin(
        {
          params: { certificationCenterId: 7 },
          payload: {
            data: {
              type: 'certification-center-invitations',
              attributes: {
                email,
                language,
              },
            },
          },
        },
        hFake
      );

      // then
      expect(response.source).to.equal(serializedData);
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#importSessions', function () {
    it('should call the usecase to import sessions', async function () {
      // given
      const request = {
        payload: { file: { path: 'csv-path' } },
        params: { certificationCenterId: 123 },
      };

      sinon.stub(csvHelpers, 'parseCsvWithHeader');
      sinon.stub(usecases, 'createSessions');

      csvHelpers.parseCsvWithHeader.resolves('result data');
      usecases.createSessions.resolves();

      // when
      await certificationCenterController.importSessions(request, hFake);

      // then
      expect(usecases.createSessions).to.have.been.calledWith({
        data: 'result data',
        certificationCenterId: request.params.certificationCenterId,
      });
    });
  });
});
