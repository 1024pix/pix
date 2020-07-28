import { Response } from 'ember-cli-mirage';

export default function index(config) {
  config.get('/schooling-registration-user-associations', (schema, request) => {
    const campaignCode =  request.queryParams.campaignCode;
    const schooolingRegistration = schema.schoolingRegistrationUserAssociations.findBy({ campaignCode });
    return schooolingRegistration ? schooolingRegistration : { data: null };
  });

  config.post('/schooling-registration-user-associations', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const campaignCode = params.data.attributes['campaign-code'];
    const birthdate = params.data.attributes.birthdate;

    if (birthdate) {
      return schema.schoolingRegistrationUserAssociations.create({ campaignCode, birthdate });
    }

    const schoolingRegistration = schema.schoolingRegistrationUserAssociations.findBy({ campaignCode });
    return schoolingRegistration ? schoolingRegistration : new Response(422);
  });

  config.put('/schooling-registration-user-associations/possibilities', () => {
    return new Response(204);
  });
}
