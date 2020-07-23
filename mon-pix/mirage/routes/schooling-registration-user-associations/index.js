import { Response } from 'ember-cli-mirage';

export default function index(config) {
  config.get('/schooling-registration-user-associations', (schema, request) => {
    const campaignCode =  request.queryParams.campaignCode;
    const schooolingRegistration = schema.schoolingRegistrationUserAssociations.findBy({ campaignCode });
    return schooolingRegistration ? schooolingRegistration : { data: null };
  });
  config.post('/schooling-registration-user-associations', () => {
    return new Response(204);
  });

  config.put('/schooling-registration-user-associations/possibilities', () => {
    return new Response(204);
  });
}
