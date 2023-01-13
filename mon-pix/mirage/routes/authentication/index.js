import postAuthentications from './post-authentications';
import { Response } from 'miragejs';

export default function index(config) {
  config.post('/revoke', () => {});

  config.post('/token', postAuthentications);

  config.post('/token-from-external-user', (schema, request) => {
    const attrs = JSON.parse(request.requestBody).data.attributes;
    let foundUser = schema.users.findBy({ email: attrs.username });
    if (!foundUser) {
      foundUser = schema.users.findBy({ username: attrs.username });
    }

    if (foundUser.shouldChangePassword) {
      return new Response(
        401,
        {},
        {
          errors: [{ title: 'PasswordShouldChange', code: 'SHOULD_CHANGE_PASSWORD', meta: foundUser.id }],
        }
      );
    }

    const response = {
      data: {
        attributes: {
          'access-token':
            'aaa.' + btoa(`{"user_id":${foundUser.id},"source":"external","iat":1545321469,"exp":4702193958}`) + '.bbb',
        },
        type: 'external-user-authentication-requests',
      },
    };
    return new Response(200, {}, response);
  });

  config.post('/token/anonymous', (schema) => {
    const createdUser = schema.users.create({
      firstName: '',
      lastName: '',
      isAnonymous: true,
      lang: 'fr',
    });

    return {
      access_token:
        'aaa.' + btoa(`{"user_id":${createdUser.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      user_id: createdUser.id,
    };
  });
}
