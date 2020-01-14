const usecases = require('../../domain/usecases');
const studentSerializer = require('../../infrastructure/serializers/jsonapi/student-serializer');

module.exports = {

  async associate(request, h) {
    const payload = request.payload.data.attributes;
    const authenticatedUserId = request.auth.credentials.userId;
    const user = {
      id: authenticatedUserId,
      firstName: payload['first-name'],
      lastName: payload['last-name'],
      birthdate: payload['birthdate'],
    };

    await usecases.linkUserToOrganizationStudentData({ campaignCode: payload['campaign-code'], user });
    return h.response().code(204);
  },

  findAssociation(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const requestedUserId = parseInt(request.query.userId);
    const campaignCode = request.query.campaignCode;

    return usecases.findAssociationBetweenUserAndOrganizationStudent({ authenticatedUserId, requestedUserId, campaignCode })
      .then(studentSerializer.serialize);
  },

  async findAssociationPossibilities(request, h) {
    const payload = request.payload.data.attributes;
    const user = {
      firstName: payload['first-name'],
      lastName: payload['last-name'],
      birthdate: payload['birthdate'],
    };

    await usecases.findAssociationPossibilities({ campaignCode: payload['campaign-code'], user });

    // we don't persist this ressource, we simulate response by adding the generated username
    const studentWithUsernameResponse = {
      'data':{
        'attributes':{
          'last-name':payload['last-name'],
          'first-name':payload['first-name'],
          'birthdate':payload['birthdate'],
          'campaign-code':request.query.campaignCode,
          'username':'firstlast1010',
        },
        'type':'student-user-associations'
      }
    };
    return h.response(studentWithUsernameResponse).code(200);
  }
};
