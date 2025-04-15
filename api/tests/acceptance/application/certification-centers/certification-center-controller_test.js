import _ from 'lodash';

import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../test-helper.js';

describe('Acceptance | API | Certification Center', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('GET /api/certification-centers/{certificationCenterId}/sessions/{sessionId}/divisions', function () {
    it('should return the divisions', async function () {
      // given
      const externalId = 'anExternalId';
      const { certificationCenter, user } = _buildUserWithCertificationCenterMemberShip(externalId);
      const organization = databaseBuilder.factory.buildOrganization({ externalId, type: 'SCO' });

      _buildOrganizationLearners(
        organization,
        { id: 1, division: '2ndB', firstName: 'Laura', lastName: 'Certif4Ever' },
        { id: 2, division: '2ndA', firstName: 'Laura', lastName: 'Booooo' },
        { id: 3, division: '2ndA', firstName: 'Laura', lastName: 'aaaaa' },
        { id: 4, division: '2ndA', firstName: 'Bart', lastName: 'Coucou' },
        { id: 5, division: '2ndA', firstName: 'Arthur', lastName: 'Coucou' },
      );
      await databaseBuilder.commit();

      const request = {
        method: 'GET',
        url: '/api/certification-centers/' + certificationCenter.id + '/divisions',
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
      expect(_.map(response.result.data, 'id')).to.deep.equal(['2ndA', '2ndB']);
    });
  });

  describe('GET /api/admin/certification-centers/{id}/certification-center-memberships', function () {
    context('when certification center membership is linked to the certification center', function () {
      it('should return 200 HTTP status', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const user1 = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: certificationCenter.id,
          userId: user1.id,
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          headers: generateAuthenticatedUserRequestHeaders(),
          method: 'GET',
          url: `/api/admin/certification-centers/${certificationCenter.id}/certification-center-memberships`,
        });

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return certification center memberships', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const user1 = databaseBuilder.factory.buildUser();
        const user2 = databaseBuilder.factory.buildUser();
        const certificationCenterMembership1 = databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: certificationCenter.id,
          userId: user1.id,
        });
        const certificationCenterMembership2 = databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: certificationCenter.id,
          userId: user2.id,
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          headers: generateAuthenticatedUserRequestHeaders(),
          method: 'GET',
          url: `/api/admin/certification-centers/${certificationCenter.id}/certification-center-memberships`,
        });

        // then
        expect(response.result.data[0].id).to.equal(certificationCenterMembership1.id.toString());
        expect(response.result.data[0].attributes['created-at']).to.deep.equal(
          certificationCenterMembership1.createdAt,
        );
        expect(response.result.data[0].attributes['role']).to.deep.equal(certificationCenterMembership1.role);

        expect(response.result.data[1].id).to.equal(certificationCenterMembership2.id.toString());
        expect(response.result.data[1].attributes['created-at']).to.deep.equal(
          certificationCenterMembership2.createdAt,
        );
        expect(response.result.data[1].attributes['role']).to.deep.equal(certificationCenterMembership2.role);

        const expectedIncluded = [
          {
            id: certificationCenter.id.toString(),
            type: 'certificationCenters',
            attributes: {
              name: certificationCenter.name,
              type: certificationCenter.type,
            },
            relationships: {
              sessions: {
                links: {
                  related: `/api/certification-centers/${certificationCenter.id}/sessions`,
                },
              },
            },
          },
          {
            id: user1.id.toString(),
            type: 'users',
            attributes: {
              email: user1.email,
              'first-name': user1.firstName,
              'last-name': user1.lastName,
            },
          },
          {
            id: user2.id.toString(),
            type: 'users',
            attributes: {
              email: user2.email,
              'first-name': user2.firstName,
              'last-name': user2.lastName,
            },
          },
        ];
        expect(response.result.included).to.deep.equal(expectedIncluded);
      });
    });
  });

  describe('GET /api/certification-centers/{id}/session-summaries', function () {
    it('should return 200 http status with serialized sessions summaries', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      databaseBuilder.factory.buildSession({
        id: 123,
        address: 'ici',
        room: 'labas',
        date: '2021-05-05',
        time: '17:00:00',
        examiner: 'Jeanine',
        finalizedAt: null,
        publishedAt: null,
        certificationCenterId,
      });
      const candidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId: 123 });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
      await databaseBuilder.commit();
      const request = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        method: 'GET',
        url: `/api/certification-centers/${certificationCenterId}/session-summaries?page[number]=1&page[size]=10`,
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([
        {
          type: 'session-summaries',
          id: '123',
          attributes: {
            address: 'ici',
            room: 'labas',
            date: '2021-05-05',
            time: '17:00:00',
            examiner: 'Jeanine',
            'enrolled-candidates-count': 1,
            'effective-candidates-count': 0,
            status: 'created',
          },
        },
      ]);
    });
  });

  describe('POST /api/certification-centers/{certificationCenterId}/session', function () {
    it('should return a 200 HTTP status with a V3 session', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      });
      await databaseBuilder.commit();

      const payload = {
        data: {
          attributes: {
            address: 'site',
            'access-code': null,
            date: '2023-06-17',
            time: '12:00',
            description: null,
            examiner: 'surveillant',
            room: 'salle',
            status: null,
            'examiner-global-comment': null,
            'supervisor-password': null,
            'has-some-clea-acquired': false,
            'has-incident': false,
            'has-joining-issue': false,
            'certification-center-id': certificationCenterId,
          },
          type: 'sessions',
        },
      };

      const options = {
        method: 'POST',
        url: `/api/certification-centers/${certificationCenterId}/session`,
        payload,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      const [session] = await knex('sessions');
      expect(session.version).to.equal(3);
    });
  });

  function _buildOrganizationLearners(organization, ...students) {
    const AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR = '2020-10-15';
    return students.map((student) =>
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        ...student,
        updatedAt: AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR,
      }),
    );
  }

  function _buildUserWithCertificationCenterMemberShip(certificationCenterExternalId) {
    const user = databaseBuilder.factory.buildUser({});
    const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
      externalId: certificationCenterExternalId,
      type: 'SCO',
    });
    databaseBuilder.factory.buildCertificationCenterMembership({
      certificationCenterId: certificationCenter.id,
      userId: user.id,
    });
    return { user, certificationCenter };
  }
});
