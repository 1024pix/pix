import { Response } from 'ember-cli-mirage';

export default function index(config) {
  config.get('/schooling-registration-user-associations', (schema, request) => {
    const campaignCode = request.queryParams.campaignCode;
    const schooolingRegistration = schema.schoolingRegistrationUserAssociations.findBy({ campaignCode });
    return schooolingRegistration ? schooolingRegistration : { data: null };
  });

  config.post('/schooling-registration-user-associations', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const campaignCode = params.data.attributes['campaign-code'];
    const birthdate = params.data.attributes.birthdate;
    return schema.schoolingRegistrationUserAssociations.create({ campaignCode, birthdate });
  });

  config.post('/schooling-registration-user-associations/student', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const campaignCode = params.data.attributes['campaign-code'];
    const studentNumber = params.data.attributes.studentNumber;
    return schema.schoolingRegistrationUserAssociations.create({ campaignCode, studentNumber });
  });

  config.post('/schooling-registration-user-associations/auto', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const campaignCode = params.data.attributes['campaign-code'];

    const schoolingRegistration = schema.schoolingRegistrationUserAssociations.findBy({ campaignCode });
    return schoolingRegistration ? schoolingRegistration : new Response(422, {}, {
      errors: [{
        status: '422',
        title: 'Unprocessable entity',
        detail: 'Cet utilisateur n\'a pas pu être rattaché à une organisation.',
      }],
    });
  });

  config.put('/schooling-registration-user-associations/possibilities', () => {
    return new Response(204);
  });
}
