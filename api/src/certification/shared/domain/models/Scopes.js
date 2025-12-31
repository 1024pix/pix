import { NotFoundError } from '../../../../shared/domain/errors.js';

/**
 * Certification scopes
 * @readonly
 * @enum {string}
 */
export const SCOPES = Object.freeze({
  CORE: 'CORE',
  PIX_PLUS_DROIT: 'DROIT',
  PIX_PLUS_EDU_1ER_DEGRE: 'EDU_1ER_DEGRE',
  PIX_PLUS_EDU_2ND_DEGRE: 'EDU_2ND_DEGRE',
  PIX_PLUS_EDU_CPE: 'EDU_CPE',
  PIX_PLUS_PRO_SANTE: 'PRO_SANTE',
});

/**
 * Finds a scope by its name.
 * @param {string} name - The name of the scope to find.
 * @returns {string} The scope value.
 * @throws {NotFoundError} If the scope is not found.
 */
function getByName(name) {
  const scope = Object.values(SCOPES).find((value) => value === name);
  if (!scope) {
    throw new NotFoundError(`Scope with name "${name}" not found.`);
  }
  return scope;
}

export const Scopes = {
  ...SCOPES,
  getByName,
};
