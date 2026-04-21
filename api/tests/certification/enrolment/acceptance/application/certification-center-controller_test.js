import _ from 'lodash';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | API | Certification Center', function () {
  describe('GET /api/certification-centers/{certificationCenterId}/sessions/{sessionId}/students', function () {
    let request;
    const externalId = 'XXXX';

    context('when user is connected', function () {
      it('should return 200 HTTP status', async function () {
        // given
        const { certificationCenter, user } = _buildUserWithCertificationCenterMemberShip(externalId);
        const organization = databaseBuilder.factory.buildOrganization({ externalId, type: 'SCO' });
        const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id });
        _buildOrganizationLearners(organization, { firstName: 'Laura', lastName: 'certifForEver', division: '2ndB' });
        await databaseBuilder.commit();

        const request = {
          method: 'GET',
          url: `/api/certification-centers/${certificationCenter.id}/sessions/${session.id}/students?page[size]=10&page[number]=1`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return the organization learners asked', async function () {
        // given
        const { certificationCenter, user } = _buildUserWithCertificationCenterMemberShip(externalId);
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId });
        const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id });
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
          url: `/api/certification-centers/${certificationCenter.id}/sessions/${session.id}/students?page[size]=10&page[number]=1`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await server.inject(request);

        // then
        expect(_.map(response.result.data, 'id')).to.deep.equal(['3', '2', '5', '4', '1']);
      });
    });

    context('when user is not connected', function () {
      it('should return 401 HTTP status code if user is not authenticated', async function () {
        // given
        _buildUserWithCertificationCenterMemberShip(externalId);
        databaseBuilder.factory.buildOrganization({ externalId });
        const certificationCenterWhereUserDoesNotHaveAccess = databaseBuilder.factory.buildCertificationCenter({
          externalId,
        });
        const session = databaseBuilder.factory.buildSession({
          certificationCenterId: certificationCenterWhereUserDoesNotHaveAccess.id,
        });
        await databaseBuilder.commit();

        request = {
          method: 'GET',
          url: `/api/certification-centers/${certificationCenterWhereUserDoesNotHaveAccess.id}/sessions/${session.id}/students?page[size]=10&page[number]=1`,
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
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
