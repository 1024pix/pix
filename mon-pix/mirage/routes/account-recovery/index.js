import Response from 'ember-cli-mirage/response';

export default function index(config) {

  config.post('/account-recovery', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const email = params.data.attributes['email'];
    const foundUser = schema.users.findBy({ email });

    if (!foundUser) {
      return new Response(204, {}, {});
    } else {
      return new Response(400, {}, {
        errors: [{ status: '400' }],
      });
    }
  });
}
