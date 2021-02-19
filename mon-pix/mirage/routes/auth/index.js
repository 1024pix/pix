import postAuthentications from './post-authentications';
import { Response } from 'ember-cli-mirage';

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
      return new Response(401, {}, { errors: [ { title: 'PasswordShouldChange' } ] });
    }

    const response = {
      data: {
        attributes: {
          'access-token': 'aaa.' + btoa(`{"user_id":${foundUser.id},"source":"external","iat":1545321469,"exp":4702193958}`) + '.bbb',
        },
        type: 'external-user-authentication-requests',
      },
    };
    return new Response(200, {}, response);
  });

  config.post('/pole-emploi/token', (schema) => {
    const createdUser = schema.users.create({
      firstName: 'Paul',
      lastName: 'Emploi',
    });

    return {
      access_token: 'aaa.' + btoa(`{"user_id":${createdUser.id},"source":"pole_emploi_connect","iat":1545321469,"exp":4702193958}`) + '.bbb',
      id_token: 'id_token',
      user_id: createdUser.id,
    };
  });

  config.post('/token/anonymous', (schema) => {
    const createdUser = schema.users.create({
      firstName: '',
      lastName: '',
      isAnonymous: true,
    });

    return {
      access_token: 'aaa.' + btoa(`{"user_id":${createdUser.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      user_id: createdUser.id,
    };
  });
}
