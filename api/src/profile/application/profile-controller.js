import { getChallengeLocale } from '../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import { profileSerializer } from '../infrastructure/serializers/jsonapi/profile-serializer.js';

const getProfile = function (request, h, dependencies = { profileSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;
  const locale = getChallengeLocale(request);

  return usecases
    .getUserProfile({ userId: authenticatedUserId, locale })
    .then(dependencies.profileSerializer.serialize);
};

const getProfileForAdmin = function (request, h, dependencies = { profileSerializer }) {
  const userId = request.params.id;
  const locale = getChallengeLocale(request);

  return usecases.getUserProfile({ userId, locale }).then(dependencies.profileSerializer.serialize);
};

const profileController = {
  getProfile,
  getProfileForAdmin,
};

export { profileController };
