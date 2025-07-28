import * as localeService from '../../../shared/domain/services/locale-service.js';
import * as userSerializer from '../../../shared/infrastructure/serializers/jsonapi/user-serializer.js';
import { requestResponseUtils } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import { authenticationMethodsSerializer } from '../../infrastructure/serializers/jsonapi/authentication-methods.serializer.js';
import * as certificationPointOfContactSerializer from '../../infrastructure/serializers/jsonapi/certification-point-of-contact.serializer.js';
import { emailVerificationSerializer } from '../../infrastructure/serializers/jsonapi/email-verification.serializer.js';
import * as updateEmailSerializer from '../../infrastructure/serializers/jsonapi/update-email.serializer.js';
import { userAccountInfoSerializer } from '../../infrastructure/serializers/jsonapi/user-account-info.serializer.js';
import { userWithActivitySerializer } from '../../infrastructure/serializers/jsonapi/user-with-activity.serializer.js';

const acceptPixCertifTermsOfService = async function (request, h) {
  const authenticatedUserId = request.auth.credentials.userId;

  await usecases.acceptPixCertifTermsOfService({
    userId: authenticatedUserId,
  });

  return h.response().code(204);
};

/**
 * @param request
 * @param h
 * @param {{
 *   userSerializer: UserSerializer
 * }} dependencies
 * @return {Promise<*>}
 */
const acceptPixLastTermsOfService = async function (request, h, dependencies = { userSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.acceptPixLastTermsOfService({
    userId: authenticatedUserId,
  });

  return dependencies.userSerializer.serialize(updatedUser);
};

/**
 * @param request
 * @param h
 * @param {{
 *   userSerializer: UserSerializer
 * }} dependencies
 * @return {Promise<*>}
 */
const acceptPixOrgaTermsOfService = async function (request, h) {
  const authenticatedUserId = request.auth.credentials.userId;

  await usecases.acceptPixOrgaTermsOfService({
    userId: authenticatedUserId,
  });

  return h.response().code(204);
};

/**
 * @param request
 * @param h
 * @param {{
 *   userSerializer: UserSerializer
 * }} dependencies
 * @return {Promise<*>}
 */
const changeUserLanguage = async function (request, h, dependencies = { userSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;
  const language = request.params.lang;
  const updatedUser = await usecases.changeUserLanguage({
    userId: authenticatedUserId,
    language,
  });

  return dependencies.userSerializer.serialize(updatedUser);
};

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
 *   userAccountInfoSerializer: UserAccountInfoSerializer
 * }} dependencies
 * @return {Promise<*>}
 */
const getCurrentUserAccountInfo = async function (request, h, dependencies = { userAccountInfoSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const userAccountInfo = await usecases.getUserAccountInfo({ userId: authenticatedUserId });

  return dependencies.userAccountInfoSerializer.serialize(userAccountInfo);
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
const createUser = async function (request, h, dependencies = { userSerializer, requestResponseUtils, localeService }) {
  const localeFromCookie = request.state?.locale;
  const canonicalLocaleFromCookie = localeFromCookie
    ? dependencies.localeService.getCanonicalLocale(localeFromCookie)
    : undefined;
  const redirectionUrl = request.payload.meta ? request.payload.meta['redirection-url'] : null;
  const user = { ...dependencies.userSerializer.deserialize(request.payload), locale: canonicalLocaleFromCookie };
  const localeFromHeader = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const password = request.payload.data.attributes.password;

  const savedUser = await usecases.createUser({
    user,
    password,
    redirectionUrl,
    locale: localeFromHeader,
    i18n: request.i18n,
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

const updateUserEmailWithValidation = async function (request, h, dependencies = { updateEmailSerializer }) {
  const userId = request.params.id;
  const code = request.payload.data.attributes.code;

  const updatedUserAttributes = await usecases.updateUserEmailWithValidation({
    userId,
    code,
  });

  return dependencies.updateEmailSerializer.serialize(updatedUserAttributes);
};

/**
 * @param request
 * @param h
 * @param {{
 *   userSerializer: UserSerializer
 * }} dependencies
 * @return {Promise<*>}
 */
const rememberUserHasSeenLastDataProtectionPolicyInformation = async function (
  request,
  h,
  dependencies = { userSerializer },
) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.rememberUserHasSeenLastDataProtectionPolicyInformation({
    userId: authenticatedUserId,
  });
  return dependencies.userSerializer.serialize(updatedUser);
};

const selfDeleteUserAccount = async function (request, h, dependencies = { requestResponseUtils }) {
  const authenticatedUserId = request.auth.credentials.userId;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  await usecases.selfDeleteUserAccount({ userId: authenticatedUserId, locale });

  return h.response().code(204);
};

const sendVerificationCode = async function (
  request,
  h,
  dependencies = { emailVerificationSerializer, requestResponseUtils },
) {
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
  const i18n = request.i18n;
  const userId = request.params.id;
  const { newEmail, password } = await dependencies.emailVerificationSerializer.deserialize(request.payload);

  await usecases.sendVerificationCode({ i18n, locale, newEmail, password, userId });
  return h.response().code(204);
};

const validateUserAccountEmail = async function (request, h) {
  const { token, redirect_url: redirectUrl } = request.query;

  const location = await usecases.validateUserAccountEmail({ token, redirectUrl });

  return h.redirect(location);
};

const getCertificationPointOfContact = async function (request) {
  const authenticatedUserId = request.auth.credentials.userId;
  const certificationPointOfContact = await usecases.getCertificationPointOfContact({ userId: authenticatedUserId });
  return certificationPointOfContactSerializer.serialize(certificationPointOfContact);
};

const rememberUserHasSeenChallengeTooltip = async function (request, h, dependencies = { userSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;
  const challengeType = request.params.challengeType;

  const updatedUser = await usecases.rememberUserHasSeenChallengeTooltip({
    userId: authenticatedUserId,
    challengeType,
  });
  return dependencies.userSerializer.serialize(updatedUser);
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
const upgradeToRealUser = async function (
  request,
  h,
  dependencies = { userSerializer, requestResponseUtils, localeService },
) {
  const anonymousUserId = request.auth.credentials.userId;

  const localeFromCookie = request.state?.locale;
  const locale = localeFromCookie ? dependencies.localeService.getCanonicalLocale(localeFromCookie) : undefined;
  const language = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const userAttributes = {
    firstName: request.payload.data.attributes['first-name'],
    lastName: request.payload.data.attributes['last-name'],
    email: request.payload.data.attributes.email,
    cgu: request.payload.data.attributes.cgu,
    locale,
  };

  const password = request.payload.data.attributes.password;
  const anonymousUserToken = request.payload.data.attributes['anonymous-user-token'];

  const realUser = await usecases.upgradeToRealUser({
    userId: anonymousUserId,
    userAttributes,
    password,
    anonymousUserToken,
    language,
  });
  return h.response(dependencies.userSerializer.serialize(realUser));
};

export const userController = {
  acceptPixCertifTermsOfService,
  acceptPixLastTermsOfService,
  acceptPixOrgaTermsOfService,
  changeUserLanguage,
  getCertificationPointOfContact,
  getCurrentUser,
  getCurrentUserAccountInfo,
  getUserAuthenticationMethods,
  rememberUserHasSeenChallengeTooltip,
  rememberUserHasSeenLastDataProtectionPolicyInformation,
  createUser,
  selfDeleteUserAccount,
  sendVerificationCode,
  updatePassword,
  updateUserEmailWithValidation,
  upgradeToRealUser,
  validateUserAccountEmail,
};
