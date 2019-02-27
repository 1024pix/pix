const moment = require('moment');

const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');
const campaignParticipationSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const certificationCenterMembershipSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-membership-serializer');
const userService = require('../../domain/services/user-service');
const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const profileService = require('../../domain/services/profile-service');
const profileSerializer = require('../../infrastructure/serializers/jsonapi/profile-serializer');
const tokenService = require('../../domain/services/token-service');
const errorManager = require('../../infrastructure/utils/error-manager');

const usecases = require('../../domain/usecases');

const { BadRequestError } = require('../../infrastructure/errors');

module.exports = {

  save(request, h) {

    const reCaptchaToken = request.payload.data.attributes['recaptcha-token'];
    const user = userSerializer.deserialize(request.payload);

    return usecases.createUser({
      user,
      reCaptchaToken,
    })
      .then((savedUser) => {
        return h.response(userSerializer.serialize(savedUser)).created();
      })
      .catch((error) => errorManager.send(h, error));
  },

  getUser(request, h) {
    const requestedUserId = parseInt(request.params.id, 10);
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.getUserWithMemberships({ authenticatedUserId, requestedUserId })
      .then(userSerializer.serialize)
      .catch((error) => errorManager.send(h, error));
  },

  // FIXME: Pas de tests ?!
  getAuthenticatedUserProfile(request, h) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);
    return userRepository.findUserById(userId)
      .then((foundUser) => {
        return profileService.getByUserId(foundUser.id);
      })
      .then((buildedProfile) => profileSerializer.serialize(buildedProfile))
      .catch((error) => errorManager.send(h, error));
  },

  updateUser(request, h) {
    const userId = request.params.id;

    return Promise.resolve(request.payload)
      .then(userSerializer.deserialize)
      .then((user) => {
        if (user.password) {
          return usecases.updateUserPassword({
            userId,
            password: user.password
          });
        }
        if (user.pixOrgaTermsOfServiceAccepted) {
          return usecases.acceptPixOrgaTermsOfService({
            userId
          });
        }
        if (user.pixCertifTermsOfServiceAccepted) {
          return usecases.acceptPixCertifTermsOfService({
            userId
          });
        }
        return Promise.reject(new BadRequestError());
      })
      .then(() => null)
      .catch((error) => errorManager.send(h, error));
  },

  getProfileToCertify(request, h) {
    const userId = request.params.id;
    const currentDate = moment().toISOString();

    return userService.getProfileToCertify(userId, currentDate)
      .catch((error) => errorManager.send(h, error));
  },

  getMemberships(request, h) {
    const authenticatedUserId = request.auth.credentials.userId.toString();
    const requestedUserId = request.params.id;

    return usecases.getUserWithMemberships({ authenticatedUserId, requestedUserId })
      .then((user) => membershipSerializer.serialize(user.memberships))
      .catch((error) => errorManager.send(h, error));
  },

  getCertificationCenterMemberships(request, h) {
    const authenticatedUserId = request.auth.credentials.userId.toString();
    const requestedUserId = request.params.id;

    return usecases.getUserCertificationCenterMemberships({ authenticatedUserId, requestedUserId })
      .then((certificationCenterMemberships) => certificationCenterMembershipSerializer.serialize(certificationCenterMemberships))
      .catch((error) => errorManager.send(h, error));
  },

  find(request) {
    const filters = {
      firstName: request.query['firstName'],
      lastName: request.query['lastName'],
      email: request.query['email'],
    };
    const pagination = {
      page: request.query['page'] ? request.query['page'] : 1,
      pageSize: request.query['pageSize'] ? request.query['pageSize'] : 10,
    };

    return usecases.findUsers({ filters, pagination })
      .then((searchResultList) => {
        const meta = {
          page: searchResultList.page,
          pageSize: searchResultList.pageSize,
          itemsCount: searchResultList.totalResults,
          pagesCount: searchResultList.pagesCount,
        };
        return userSerializer.serialize(searchResultList.paginatedResults, meta);
      });
  },

  getCampaignParticipations(request, h) {
    const authenticatedUserId = request.auth.credentials.userId.toString();
    const requestedUserId = request.params.id;

    return usecases.getUserCampaignParticipations({ authenticatedUserId, requestedUserId })
      .then(campaignParticipationSerializer.serialize)
      .catch((error) => errorManager.send(h, error));
  }
};
