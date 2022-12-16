export default function index(config) {
  config.post('/sup-organization-learners/association', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const campaignCode = params.data.attributes['campaign-code'];
    const studentNumber = params.data.attributes.studentNumber;
    return schema.supOrganizationLearners.create({ campaignCode, studentNumber });
  });
}
