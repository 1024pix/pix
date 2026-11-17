export default function index(config) {
  config.post('/sup-organization-learners/association', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const organizationId = params.data.attributes['organization-id'];
    const studentNumber = params.data.attributes.studentNumber;
    return schema.supOrganizationLearners.create({ organizationId, studentNumber });
  });
}
