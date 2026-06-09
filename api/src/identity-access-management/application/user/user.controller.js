import { getI18nFromRequest } from '../../../shared/infrastructure/i18n/i18n.js';
import { getUserLocale } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import { authenticationMethodsSerializer } from '../../infrastructure/serializers/jsonapi/authentication-methods.serializer.js';
import * as certificationPointOfContactSerializer from '../../infrastructure/serializers/jsonapi/certification-point-of-contact.serializer.js';
import { emailVerificationSerializer } from '../../infrastructure/serializers/jsonapi/email-verification.serializer.js';
import * as updateEmailSerializer from '../../infrastructure/serializers/jsonapi/update-email.serializer.js';
import { userAccountInfoSerializer } from '../../infrastructure/serializers/jsonapi/user-account-info.serializer.js';
import * as userSerializer from '../../infrastructure/serializers/jsonapi/user-serializer.js';
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
 * @return {Promise<*>}
 */
const acceptPixLastTermsOfService = async function (request) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.acceptPixLastTermsOfService({
    userId: authenticatedUserId,
  });

  return userSerializer.serialize(updatedUser);
};

/**
 * @param request
 * @param h
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
 * @return {Promise<*>}
 */
const changeUserLocale = async function (request) {
  const authenticatedUserId = request.auth.credentials.userId;
  const locale = getUserLocale(request);

  const updatedUser = await usecases.changeUserLocale({ userId: authenticatedUserId, locale });

  return userSerializer.serialize(updatedUser);
};

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
const getCurrentUser = async function (request) {
  const authenticatedUserId = request.auth.credentials.userId;

  const result = await usecases.getCurrentUser({ authenticatedUserId });

  return userWithActivitySerializer.serialize(result);
};

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
const getCurrentUserAccountInfo = async function (request) {
  const authenticatedUserId = request.auth.credentials.userId;

  const userAccountInfo = await usecases.getUserAccountInfo({ userId: authenticatedUserId });

  return userAccountInfoSerializer.serialize(userAccountInfo);
};

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
const getUserAuthenticationMethods = async function (request) {
  const userId = request.params.id;

  const authenticationMethods = await usecases.findUserAuthenticationMethods({ userId });

  return authenticationMethodsSerializer.serialize(authenticationMethods);
};

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
const createUser = async function (request, h) {
  const locale = getUserLocale(request);
  const i18n = getI18nFromRequest(request);

  const redirectionUrl = request.payload.meta ? request.payload.meta['redirection-url'] : null;
  const user = userSerializer.deserialize(request.payload);

  const password = request.payload.data.attributes.password;

  const savedUser = await usecases.createUser({
    user,
    password,
    redirectionUrl,
    locale,
    i18n,
  });

  return h.response(userSerializer.serialize(savedUser)).created();
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

const updateUserEmailWithValidation = async function (request) {
  const userId = request.params.id;
  const code = request.payload.data.attributes.code;

  const updatedUserAttributes = await usecases.updateUserEmailWithValidation({
    userId,
    code,
  });

  return updateEmailSerializer.serialize(updatedUserAttributes);
};

const addUserEmailWithValidation = async function (request) {
  const userId = request.params.id;
  const code = request.payload.data.attributes.code;

  const updatedUserAttributes = await usecases.addUserEmailWithValidation({
    userId,
    code,
  });

  return updateEmailSerializer.serialize(updatedUserAttributes);
};

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
const rememberUserHasSeenLastDataProtectionPolicyInformation = async function (request) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.rememberUserHasSeenLastDataProtectionPolicyInformation({
    userId: authenticatedUserId,
  });
  return userSerializer.serialize(updatedUser);
};

const selfDeleteUserAccount = async function (request, h) {
  const authenticatedUserId = request.auth.credentials.userId;
  const locale = getUserLocale(request);

  await usecases.selfDeleteUserAccount({ userId: authenticatedUserId, locale });

  return h.response().code(204);
};

const sendVerificationCode = async function (request, h) {
  const locale = getUserLocale(request);

  const userId = request.auth.credentials.userId;
  const { action, newEmail, password } = await emailVerificationSerializer.deserialize(request.payload);

  await usecases.sendVerificationCode({ locale, action, newEmail, password, userId });
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

const rememberUserHasSeenChallengeTooltip = async function (request) {
  const authenticatedUserId = request.auth.credentials.userId;
  const challengeType = request.params.challengeType;

  const updatedUser = await usecases.rememberUserHasSeenChallengeTooltip({
    userId: authenticatedUserId,
    challengeType,
  });
  return userSerializer.serialize(updatedUser);
};

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
const upgradeToRealUser = async function (request, h) {
  const userId = request.auth.credentials.userId;
  const locale = getUserLocale(request);

  const userAttributes = {
    firstName: request.payload.data.attributes['first-name'],
    lastName: request.payload.data.attributes['last-name'],
    email: request.payload.data.attributes.email,
    cgu: request.payload.data.attributes.cgu,
    locale,
  };

  const password = request.payload.data.attributes.password;

  const realUser = await usecases.upgradeToRealUser({
    userId,
    userAttributes,
    password,
    locale,
  });
  return h.response(userSerializer.serialize(realUser));
};

export const userController = {
  acceptPixCertifTermsOfService,
  acceptPixLastTermsOfService,
  acceptPixOrgaTermsOfService,
  changeUserLocale,
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
  addUserEmailWithValidation,
  upgradeToRealUser,
  validateUserAccountEmail,
};
