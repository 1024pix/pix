import { Response } from 'ember-cli-mirage';

export default function index(config) {
  config.post('/password-reset-demands', (schema, request) => {
    const attrs = JSON.parse(request.requestBody);
    const sentEmail = attrs.data.attributes.email;
    const matchingAccount = schema.users.findBy({ email: sentEmail });

    if (matchingAccount !== null) {
      return schema.passwordResetDemands.create({ email: sentEmail });
    } else {
      return new Response(400);
    }
  });

  config.get('/password-reset-demands/:key', (schema, request) => {
    const demand = schema.passwordResetDemands.findBy({ temporaryKey: request.params.key });
    return schema.users.findBy({ email: demand.email });
  });
}
