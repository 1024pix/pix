import { Response } from 'miragejs';
import { decodeToken } from 'mon-pix/helpers/jwt';

export default function index(config) {
  config.post('/sco-organization-learners/association', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const organizationId = params.data.attributes['organization-id'];
    const birthdate = params.data.attributes.birthdate;
    return schema.scoOrganizationLearners.create({ organizationId, birthdate });
  });

  config.post('/sco-organization-learners/association/auto', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const organizationId = params.data.attributes['organization-id'];

    const scoOrganizationLearner = schema.scoOrganizationLearners.findBy({ organizationId });
    return scoOrganizationLearner
      ? scoOrganizationLearner
      : new Response(
          422,
          {},
          {
            errors: [
              {
                status: '422',
                title: 'Unprocessable entity',
                detail: "Cet utilisateur n'a pas pu être rattaché à une organisation.",
              },
            ],
          },
        );
  });

  config.put('/sco-organization-learners/possibilities', () => {
    return new Response(204);
  });

  config.post('/sco-organization-learners/dependent', (schema, request) => {
    const params = JSON.parse(request.requestBody);

    const campaignCode = params.data.attributes['campaign-code'];
    const firstName = params.data.attributes['first-name'];
    const lastName = params.data.attributes['last-name'];
    schema.scoOrganizationLearners.create({ campaignCode, firstName, lastName });
    return new Response(204);
  });

  config.post('/sco-organization-learners/external', (schema, request) => {
    const params = JSON.parse(request.requestBody);
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
      lang: 'fr',
    };

    const user = schema.users.create(newUser);
    return schema.externalUsers.create({
      accessToken:
        'aaa.' + btoa(`{"user_id":${user.id},"source":"external","iat":1545321469,"exp":4702193958}`) + '.bbb',
    });
  });

  config.post('/sco-organization-learners/account-recovery', (schema, request) => {
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
            id: '3',
            attributes: {
              'first-name': foundUser.firstName,
              'last-name': foundUser.lastName,
              username: foundUser.username,
              email: foundUser.email,
              'latest-organization-name': 'Collège FouFouFou',
            },
          },
        },
      );
    } else if (foundUser) {
      return new Response(
        409,
        {},
        {
          errors: [{ status: '409' }],
        },
      );
    } else {
      return new Response(
        404,
        {},
        {
          errors: [{ status: '404', message: 'Not found' }],
        },
      );
    }
  });
}
