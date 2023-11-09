import _ from 'lodash';

import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';
import { constants as apps } from '../../../../../lib/domain/constants.js';

describe('Acceptance | Controller | prescriber-informations-controller', function () {
  let user;
  let organization;
  let membership;
  let userOrgaSettingsId;
  let options;
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  function createExpectedPrescriber({ user, membership, userOrgaSettingsId, organization }) {
    return {
      data: {
        type: 'prescribers',
        attributes: {
          'first-name': user.firstName,
          'last-name': user.lastName,
          'pix-orga-terms-of-service-accepted': false,
          'are-new-year-organization-learners-imported': false,
          'participant-count': 0,
          lang: user.lang,
          'enable-multiple-sending-assessment': false,
          'compute-organization-learner-certificability': false,
          features: {
            [apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: false,
            [apps.ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: false,
          },
        },
        relationships: {
          memberships: {
            data: [
              {
                id: membership.id.toString(),
                type: 'memberships',
              },
            ],
          },
          'user-orga-settings': {
            data: {
              id: userOrgaSettingsId.toString(),
              type: 'userOrgaSettings',
            },
          },
        },
      },
      included: [
        {
          id: organization.id.toString(),
          type: 'organizations',
          attributes: {
            credit: organization.credit,
            'external-id': organization.externalId,
            'is-managing-students': organization.isManagingStudents,
            name: organization.name,
            type: organization.type,
          },
          relationships: {
            divisions: {
              links: {
                related: `/api/organizations/${organization.id}/divisions`,
              },
            },
            memberships: {
              links: {
                related: `/api/organizations/${organization.id}/memberships`,
              },
            },
            groups: {
              links: {
                related: `/api/organizations/${organization.id}/groups`,
              },
            },
            'organization-invitations': {
              links: {
                related: `/api/organizations/${organization.id}/invitations`,
              },
            },
            'target-profiles': {
              links: {
                related: `/api/organizations/${organization.id}/target-profiles`,
              },
            },
          },
        },
        {
          id: membership.id.toString(),
          type: 'memberships',
          attributes: {
            'organization-role': membership.organizationRole,
          },
          relationships: {
            organization: {
              data: {
                id: organization.id.toString(),
                type: 'organizations',
              },
            },
          },
        },
        {
          id: userOrgaSettingsId.toString(),
          type: 'userOrgaSettings',
          attributes: {
            user: undefined,
          },
          relationships: {
            organization: {
              data: {
                id: organization.id.toString(),
                type: 'organizations',
              },
            },
          },
        },
      ],
    };
  }

  describe('GET /api/prescription/prescribers/:id', function () {
    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization({
        credit: 5,
        isManagingStudents: true,
      });
      membership = databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: user.id });
      userOrgaSettingsId = databaseBuilder.factory.buildUserOrgaSettings({
        currentOrganizationId: organization.id,
        userId: user.id,
      }).id;
      databaseBuilder.factory.buildFeature(apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT);
      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/prescription/prescribers/${user.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    });

    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const otherUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      it('should 200 HTTP status code', async function () {
        // given
        const expectedPrescriber = createExpectedPrescriber({ user, membership, userOrgaSettingsId, organization });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(_.omit(response.result, ['data.id'])).to.deep.equal(expectedPrescriber);
      });
    });
  });
});
