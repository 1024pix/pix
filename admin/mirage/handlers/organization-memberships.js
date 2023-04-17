import { Response } from 'miragejs';

export function createOrganizationMembership(schema, request) {
  const params = JSON.parse(request.requestBody);

  const userId = params.data.relationships.user.data.id;
  const organizationId = params.data.relationships.organization.data.id;

  const organizationMemberships = schema.organizationMemberships.where({ organizationId, userId });

  if (organizationMemberships.length > 0) {
    return new Response(
      400,
      {},
      {
        errors: [
          {
            status: 400,
            title: 'membership already exists',
            description:
              'A membership for given user ID and organization ID already exists and can not be created again.',
          },
        ],
      }
    );
  }

  const user = schema.users.find(userId);
  const organization = schema.organizations.find(organizationId);

  if (!user || !organization) {
    return new Response(
      404,
      {},
      {
        errors: [
          {
            status: 404,
            title: 'user or organization not found',
            description: 'Can not create membership because user or organization were not found.',
          },
        ],
      }
    );
  }

  return schema.organizationMemberships.create({ user, organization });
}
