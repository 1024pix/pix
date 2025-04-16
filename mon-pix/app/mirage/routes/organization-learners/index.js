import { Response } from 'miragejs';

export default function index(config) {
  config.get('/organization-learners', (schema, request) => {
    const campaignCode = request.queryParams.campaignCode;
    const organizationLearnerIdentity = schema.organizationLearnerIdentities.first();
    if (campaignCode === 'FORBIDDEN') {
      return new Response(
        412,
        {},
        {
          errors: [
            {
              status: '412',
              title: 'Precondition failed',
            },
          ],
        },
      );
    }
    return organizationLearnerIdentity ? organizationLearnerIdentity : { data: null };
  });
}
