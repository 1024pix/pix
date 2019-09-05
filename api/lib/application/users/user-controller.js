const campaignParticipationSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');
const certificationCenterMembershipSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-membership-serializer');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const pixScoreSerializer = require('../../infrastructure/serializers/jsonapi/pix-score-serializer');
const scorecardSerializer = require('../../infrastructure/serializers/jsonapi/scorecard-serializer');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');
const requestUtils = require('../../infrastructure/utils/request-utils');

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

  getCurrentUser(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.getCurrentUser({ authenticatedUserId })
      .then(userSerializer.serialize);
  },

  updateUser(request) {
    const requestedUserId = parseInt(request.params.id);

    return Promise.resolve(request.payload)
      .then(userSerializer.deserialize)
      .then((user) => {
        if (user.password) {
          return usecases.updateUserPassword({
            userId: requestedUserId,
            password: user.password,
            temporaryKey: request.query['temporary-key'] || '',
          });
        }
        if (user.pixCertifTermsOfServiceAccepted) {
          const authenticatedUserId = requestUtils.extractUserIdFromRequest(request);
          return usecases.acceptPixCertifTermsOfService({
            authenticatedUserId,
            requestedUserId
          });
        }
        return Promise.reject(new BadRequestError());
      })
      .then(() => null);
  },

  async acceptPixOrgaTermsOfService(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.acceptPixOrgaTermsOfService({
      userId: authenticatedUserId
    });

    return userSerializer.serialize(updatedUser);
  },

  async rememberUserHasSeenAssessmentInstructions(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.rememberUserHasSeenAssessmentInstructions({ userId: authenticatedUserId });
    return userSerializer.serialize(updatedUser);
  },

  async rememberUserHasSeenNewProfileInfo(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.rememberUserHasSeenNewProfileInfo({ userId: authenticatedUserId });
    return userSerializer.serialize(updatedUser);
  },

  getMemberships(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.getUserWithMemberships({ userId: authenticatedUserId })
      .then((user) => membershipSerializer.serialize(user.memberships));
  },

  getCertificationCenterMemberships(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.getUserCertificationCenterMemberships({ userId: authenticatedUserId })
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
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.findCampaignParticipationsRelatedToUser({ userId: authenticatedUserId })
      .then(campaignParticipationSerializer.serialize);
  },

  getPixScore(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.getUserPixScore({ userId: authenticatedUserId })
      .then(pixScoreSerializer.serialize);
  },

  getScorecards(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.getUserScorecards({ userId: authenticatedUserId })
      .then(scorecardSerializer.serialize);
  },

  resetScorecard(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const competenceId = request.params.competenceId;

    return usecases.resetScorecard({ userId: authenticatedUserId, competenceId })
      .then(scorecardSerializer.serialize);
  }
};
