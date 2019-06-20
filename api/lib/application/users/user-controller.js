const campaignParticipationSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');
const certificationCenterMembershipSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-membership-serializer');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const pixScoreSerializer = require('../../infrastructure/serializers/jsonapi/pix-score-serializer');
const profileSerializer = require('../../infrastructure/serializers/jsonapi/profile-serializer');
const scorecardSerializer = require('../../infrastructure/serializers/jsonapi/scorecard-serializer');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');

const profileService = require('../../domain/services/profile-service');
const tokenService = require('../../domain/services/token-service');
const userService = require('../../domain/services/user-service');

const userRepository = require('../../../lib/infrastructure/repositories/user-repository');

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
      });
  },

  getUser(request) {
    const authenticatedUserId = request.auth.credentials.userId.toString();
    const requestedUserId = request.params.id;

    return usecases.getUser({ authenticatedUserId, requestedUserId })
      .then(userSerializer.serialize);
  },

  getCurrentUser(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.getCurrentUser({ authenticatedUserId })
      .then(userSerializer.serialize);
  },

  // FIXME: Pas de tests ?!
  getAuthenticatedUserProfile(request) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);
    return userRepository.findUserById(userId)
      .then((foundUser) => {
        return profileService.getByUserId(foundUser.id);
      })
      .then((buildedProfile) => profileSerializer.serialize(buildedProfile));
  },

  updateUser(request) {
    const userId = request.params.id;

    return Promise.resolve(request.payload)
      .then(userSerializer.deserialize)
      .then((user) => {
        if (user.password) {
          return usecases.updateUserPassword({
            userId,
            password: user.password,
            temporaryKey: request.query['temporary-key'] || '',
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
        if (user.hasSeenMigrationModal) {
          return usecases.updateUserHasSeenMigrationModal({
            userId
          });
        }
        return Promise.reject(new BadRequestError());
      })
      .then(() => null);
  },

  getProfileToCertify(request) {
    const userId = request.params.id;
    const currentDate = new Date();

    return userService.getProfileToCertifyV1(userId, currentDate);
  },

  getMemberships(request) {
    const authenticatedUserId = request.auth.credentials.userId.toString();
    const requestedUserId = request.params.id;

    return usecases.getUserWithMemberships({ authenticatedUserId, requestedUserId })
      .then((user) => membershipSerializer.serialize(user.memberships));
  },

  getCertificationCenterMemberships(request) {
    const authenticatedUserId = request.auth.credentials.userId.toString();
    const requestedUserId = request.params.id;

    return usecases.getUserCertificationCenterMemberships({ authenticatedUserId, requestedUserId })
      .then((certificationCenterMemberships) => certificationCenterMembershipSerializer.serialize(certificationCenterMemberships));
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

  getCampaignParticipations(request) {
    const authenticatedUserId = request.auth.credentials.userId.toString();
    const requestedUserId = request.params.id;

    return usecases.findCampaignParticipationsRelatedToUser({ authenticatedUserId, requestedUserId })
      .then(campaignParticipationSerializer.serialize);
  },

  getPixScore(request) {
    const authenticatedUserId = request.auth.credentials.userId.toString();
    const requestedUserId = request.params.id;
    return usecases.getUserPixScore({ authenticatedUserId, requestedUserId })
      .then(pixScoreSerializer.serialize);
  },

  getScorecards(request) {
    const authenticatedUserId = request.auth.credentials.userId.toString();
    const requestedUserId = request.params.id;
    return usecases.getUserScorecards({ authenticatedUserId, requestedUserId })
      .then(scorecardSerializer.serialize);
  },

  async resetScorecard(request) {
    const authenticatedUserId = request.auth.credentials.userId.toString();
    const requestedUserId = request.params.userId;
    const competenceId = request.params.competenceId;

    return usecases.resetScorecard({ authenticatedUserId, requestedUserId, competenceId })
      .then(scorecardSerializer.serialize);
  }
};
