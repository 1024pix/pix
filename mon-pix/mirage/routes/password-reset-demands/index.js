import { Response } from 'miragejs';

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

  config.post('/update-password', (schema, request) => {
    const body = JSON.parse(request.requestBody);

    const demand = schema.passwordResetDemands.findBy({ temporaryKey: body['temporary-key'] });
    if (!demand) {
      return new Response(404);
    } else {
      return new Response(204);
    }
  });
}
