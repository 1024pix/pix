import { requestResponseUtils } from '../../../lib/infrastructure/utils/request-response-utils.js';
import * as localeService from '../../shared/domain/services/locale-service.js';
import * as userSerializer from '../../shared/infrastructure/serializers/jsonapi/user-serializer.js';
import { usecases } from '../domain/usecases/index.js';

/**
 * @param request
 * @param h
 * @param {object} dependencies
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
 * @typedef {object} UserController
 * @property {function} save
 */
const userController = { save };

export { userController };
