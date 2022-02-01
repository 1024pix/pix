import Response from 'ember-cli-mirage/response';
import { decodeToken } from 'mon-pix/helpers/jwt';

export default function index(config) {
  config.post('/schooling-registration-dependent-users', (schema, request) => {
    const params = JSON.parse(request.requestBody);

    const campaignCode = params.data.attributes['campaign-code'];
    const organizationId = schema.campaigns.findBy({ code: campaignCode }).organizationId;

    const firstName = params.data.attributes['first-name'];
    const lastName = params.data.attributes['last-name'];
    const newUser = {
      firstName,
      lastName,
      email: params.data.attributes['email'],
      username: params.data.attributes['username'],
      password: params.data.attributes['password'],
    };
    const student = schema.students.findBy({ firstName, lastName });
    const userId = schema.users.create(newUser).id;
    student.update({ userId, organizationId });
    schema.schoolingRegistrationUserAssociations.create({ campaignCode });
    return new Response(204);
  });

  config.post('/schooling-registration-dependent-users/external-user-token', (schema, request) => {
    const params = JSON.parse(request.requestBody);

    const campaignCode = params.data.attributes['campaign-code'];
    const organizationId = schema.campaigns.findBy({ code: campaignCode }).organizationId;

    const externalUserToken = params.data.attributes['external-user-token'];
    const decodedExternalUserToken = decodeToken(externalUserToken);

    const firstName = decodedExternalUserToken['first_name'];
    const lastName = decodedExternalUserToken['last_name'];
    const samlId = decodedExternalUserToken['saml_id'];

    const newUser = {
      firstName,
      lastName,
      samlId,
      password: '',
      cgu: false,
    };

    const student = schema.students.findBy({ firstName, lastName });
    const user = schema.users.create(newUser);
    student.update({ userId: user.id, organizationId });

    return schema.externalUsers.create({
      accessToken:
        'aaa.' + btoa(`{"user_id":${user.id},"source":"external","iat":1545321469,"exp":4702193958}`) + '.bbb',
    });
  });

  config.post('/schooling-registration-dependent-users/recover-account', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const firstName = params.data.attributes['first-name'];
    const lastName = params.data.attributes['last-name'];
    const ineIna = params.data.attributes['ine-ina'];
    const birthdate = params.data.attributes['birthdate'];
    const foundUser = schema.users.findBy({ firstName, lastName });
    const foundStudent = schema.studentInformation.findBy({ ineIna, firstName, lastName, birthdate });

    if (foundUser && foundStudent) {
      return new Response(
        200,
        {},
        {
          data: {
            type: 'student-information',
            id: 3,
            attributes: {
              'first-name': foundUser.firstName,
              'last-name': foundUser.lastName,
              username: foundUser.username,
              email: foundUser.email,
              'latest-organization-name': 'Collège FouFouFou',
            },
          },
        }
      );
    } else if (foundUser) {
      return new Response(
        409,
        {},
        {
          errors: [{ status: '409' }],
        }
      );
    } else {
      return new Response(
        404,
        {},
        {
          errors: [{ status: '404', message: 'Not found' }],
        }
      );
    }
  });
}
