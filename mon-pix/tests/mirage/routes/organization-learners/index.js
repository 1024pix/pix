export default function index(config) {
  config.get('/organization-learners', (schema) => {
    const organizationLearnerIdentity = schema.organizationLearnerIdentities.first();
    return organizationLearnerIdentity ? organizationLearnerIdentity : { data: null };
  });
}
