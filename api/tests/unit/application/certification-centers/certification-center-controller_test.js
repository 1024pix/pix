const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const certificationCenterMembershipSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-center-membership-serializer');
const certificationCenterController = require('../../../../lib/application/certification-centers/certification-center-controller');

describe('Unit | Controller | certifications-center-controller', () => {

  describe('#getStudents', () => {

    it('should return a paginated serialized list of students', async () => {
      // given
      const student = domainBuilder.buildSchoolingRegistration({ division: '3A' });

      const request = {
        auth: {
          credentials: { userId: '111' },
        },
        params: {
          certificationCenterId: '99',
          sessionId: '88',
        },
        query: { 'page[size]': 10, 'page[number]': 1, 'filter[divisions][]': '3A' },
      };

      sinon
        .stub(usecases, 'findStudentsForEnrollment')
        .withArgs({ certificationCenterId: 99, sessionId: 88, page: { size: 10, number: 1 }, filter: { divisions: [ '3A' ] } })
        .resolves({
          data: [student],
          pagination: { page: 1, pageSize: 10, rowCount: 1, pageCount: 1 },
        });

      // when
      const response = await certificationCenterController.getStudents(request, hFake);

      // then
      expect(response).to.deep.equal(
        {
          data: [{
            'attributes': {
              'birthdate': student.birthdate,
              'division': student.division,
              'first-name': student.firstName,
              'last-name': student.lastName,
            },
            'id': `${student.id}`,
            'type': 'students',

          }],
          meta: { page: 1, pageSize: 10, rowCount: 1, pageCount: 1 },
        },
      );
    });
  });

  describe('#getDivisions', () => {

    it('Should return a serialized list of divisions', async () => {
      // given
      const request = {
        auth: {
          credentials: { userId: '111' },
        },
        params: {
          certificationCenterId: '99',
        },
      };

      sinon
        .stub(usecases, 'findDivisionsByCertificationCenter')
        .withArgs({ certificationCenterId: 99 })
        .resolves([{ name: '3A' }, { name: '3B' }, { name: '4C' }]);

      // when
      const response = await certificationCenterController.getDivisions(request, hFake);

      // then
      expect(response).to.deep.equal(
        {
          data: [{
            'type': 'divisions',
            'id': '3A',
            'attributes': {
              'name': '3A',
            },
          },
          {
            'type': 'divisions',
            'id': '3B',
            'attributes': {
              'name': '3B',
            },
          },
          {
            'type': 'divisions',
            'id': '4C',
            'attributes': {
              'name': '4C',
            },
          }],
        },
      );
    });
  });

  describe('#findCertificationCenterMembershipsByCertificationCenter', () => {

    const certificationCenterId = 1;

    const request = {
      params: {
        certificationCenterId,
      },
    };

    beforeEach(() => {
      sinon.stub(usecases, 'findCertificationCenterMembershipsByCertificationCenter');
      sinon.stub(certificationCenterMembershipSerializer, 'serialize');
    });

    it('should call usecase and serializer and return ok', async () => {
      // given
      usecases.findCertificationCenterMembershipsByCertificationCenter.withArgs({
        certificationCenterId,
      }).resolves({});
      certificationCenterMembershipSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await certificationCenterController.findCertificationCenterMembershipsByCertificationCenter(request);

      // then
      expect(response).to.equal('ok');
    });
  });

  describe('#createCertificationCenterMembershipByEmail', () => {

    const certificationCenterId = 1;
    const email = 'user@example.net';

    const request = {
      params: { certificationCenterId },
      payload: { email },
    };

    beforeEach(() => {
      sinon.stub(usecases, 'createCertificationCenterMembershipByEmail');
      sinon.stub(certificationCenterMembershipSerializer, 'serialize');

      usecases.createCertificationCenterMembershipByEmail.resolves();
      certificationCenterMembershipSerializer.serialize.returns('ok');
    });

    it('should call usecase and serializer and return 201 HTTP code', async () => {
      // when
      const response = await certificationCenterController.createCertificationCenterMembershipByEmail(request, hFake);

      // then
      expect(usecases.createCertificationCenterMembershipByEmail)
        .calledWith({ certificationCenterId, email });
      expect(response.source).to.equal('ok');
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('#findPaginatedSessionSummaries', () => {

    beforeEach(() => {
      sinon.stub(usecases, 'findPaginatedCertificationCenterSessionSummaries');
    });

    it('should return a list of JSON API session summaries with pagination information', async () => {
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
        .resolves({ models: [sessionSummary], meta: { page: 1, pageSize: 10, itemsCount: 1, pagesCount: 1, hasSessions: true } });

      // when
      const serializedSessionSummaries = await certificationCenterController.findPaginatedSessionSummaries(request, hFake);

      // then
      expect(serializedSessionSummaries).to.deep.equal({
        data: [{
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
        }],
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
});
