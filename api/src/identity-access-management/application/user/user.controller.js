import * as localeService from '../../../shared/domain/services/locale-service.js';
import * as userSerializer from '../../../shared/infrastructure/serializers/jsonapi/user-serializer.js';
import { requestResponseUtils } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import * as authenticationMethodsSerializer from '../../infrastructure/serializers/jsonapi/authentication-methods.serializer.js';
import { userWithActivitySerializer } from '../../infrastructure/serializers/jsonapi/user-with-activity.serializer.js';

/**
 * @param request
 * @param h
 * @param {{
 *   userWithActivitySerializer: UserWithActivitySerializer
 * }} dependencies
 * @return {Promise<*>}
 */
const getCurrentUser = async function (request, h, dependencies = { userWithActivitySerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const result = await usecases.getCurrentUser({ authenticatedUserId });

  return dependencies.userWithActivitySerializer.serialize(result);
};

/**
 * @param request
 * @param h
 * @param {{
 *   authenticationMethodsSerializer: AuthenticationMethodsSerializer
 * }} dependencies
 * @return {Promise<*>}
 */
const getUserAuthenticationMethods = async function (request, h, dependencies = { authenticationMethodsSerializer }) {
  const userId = request.params.id;

  const authenticationMethods = await usecases.findUserAuthenticationMethods({ userId });

  return dependencies.authenticationMethodsSerializer.serialize(authenticationMethods);
};

/**
 * @param request
 * @param h
 * @param {Object} dependencies
 * @param {LocaleService} dependencies.localeService
 * @param {RequestResponseUtils} dependencies.requestResponseUtils
 * @param {UserSerializer} dependencies.userSerializer
 * @return {Promise<*>}
 */
const save = async function (request, h, dependencies = { userSerializer, requestResponseUtils, localeService }) {
  const localeFromCookie = request.state?.locale;
  const canonicalLocaleFromCookie = localeFromCookie
    ? dependencies.localeService.getCanonicalLocale(localeFromCookie)
    : undefined;
  const campaignCode = request.payload.meta ? request.payload.meta['campaign-code'] : null;
  const user = { ...dependencies.userSerializer.deserialize(request.payload), locale: canonicalLocaleFromCookie };
  const localeFromHeader = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const password = request.payload.data.attributes.password;

  const savedUser = await usecases.createUser({
    user,
    password,
    campaignCode,
    localeFromHeader,
  });

  return h.response(dependencies.userSerializer.serialize(savedUser)).created();
};

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
const updatePassword = async function (request, h) {
  const userId = request.params.id;
  const password = request.payload.data.attributes.password;

  await usecases.updateUserPassword({
    userId,
    password,
    temporaryKey: request.query['temporary-key'] || '',
  });

  return h.response().code(204);
};

export const userController = {
  getCurrentUser,
  getUserAuthenticationMethods,
  save,
  updatePassword,
};
