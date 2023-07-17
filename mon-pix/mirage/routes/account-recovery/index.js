import { Response } from 'miragejs';

export default function index(config) {
  config.post('/account-recovery', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const email = params.data.attributes['email'];
    const foundUser = schema.users.findBy({ email });

    if (!foundUser) {
      return new Response(204);
    } else {
      return new Response(
        400,
        {},
        {
          errors: [{ status: '400', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS' }],
        },
      );
    }
  });

  config.get('/account-recovery/:temporaryKey', () => {
    const response = {
      data: {
        type: 'account-recovery-demands',
        id: '10000001',
        attributes: {
          'first-name': 'George',
          email: 'George@example.net',
        },
      },
    };

    return new Response(200, {}, response);
  });

  config.patch('/account-recovery', () => {
    return new Response(204);
  });
}
