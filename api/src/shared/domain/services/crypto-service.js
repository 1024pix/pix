import crypto from 'node:crypto';
import util from 'node:util';

import bcrypt from 'bcrypt';
import * as jose from 'jose';

import { config } from '../../../../src/shared/config.js';
import { PasswordNotMatching } from '../errors.js';

const randomBytes = util.promisify(crypto.randomBytes);
const scrypt = util.promisify(crypto.scrypt);

const phcRegexp =
  /^\$(?<algoDesc>[\w+-]+)\$N=(?<N>\d+)\$r=(?<r>\d+)\$p=(?<p>\d+)\$(?<initializationVector>[\w/+=-]+)\$(?<encryptedText>[\w/+=-]+)$/;

const authenticationKey = config.authentication.secret;
const { bcryptNumberOfSaltRounds } = config;

const N = Math.pow(2, 13);
const r = 8;
const p = 10;

const algoDesc = 'scrypt+aes-256-ctr';

const AES_256_CTR_ALGO_NAME = 'aes-256-ctr';
const AES_256_CTR_CIPHER_IV_LENGTH = 16;
const AES_256_CTR_KEY_LENGTH = 32;

const hashPassword = function (password) {
  return bcrypt.hash(password, bcryptNumberOfSaltRounds);
};

const hashPasswordSync = function (password) {
  // eslint-disable-next-line n/no-sync
  return bcrypt.hashSync(password, bcryptNumberOfSaltRounds);
};

const checkPassword = async function ({ password, passwordHash }) {
  const matching = await bcrypt.compare(password, passwordHash);
  if (!matching) {
    throw new PasswordNotMatching();
  }
};

/**
 * @param {string} text
 * @param {string} key
 * @returns {Promise<string>} an output in PHC format.
 *   Example: $scrypt+aes-256-ctr$N=8192$r=8$p=10$bsKRpytT0ocFpxmIlk/COw==$L0kaiHkLjrbD3C
 */
const encrypt = async function (text, key = authenticationKey) {
  const initializationVector = await randomBytes(AES_256_CTR_CIPHER_IV_LENGTH);

  const derivedKey = await scrypt(key, initializationVector, AES_256_CTR_KEY_LENGTH, { N, r, p });
  const cipher = crypto.createCipheriv(AES_256_CTR_ALGO_NAME, derivedKey, initializationVector);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const encryptedText = encrypted.toString('base64');
  const initializationVectorAsBase64 = initializationVector.toString('base64');
  const encryptedTextPhc = `$${algoDesc}$N=${N}$r=${r}$p=${p}$${initializationVectorAsBase64}$${encryptedText}`;
  return encryptedTextPhc;
};

/**
 * @param {string} phcText
 * @param {string} key
 * @returns {Promise<string>} a decrypted text
 */
const decrypt = async function (phcText, key = authenticationKey) {
  const matched = phcRegexp.exec(phcText);
  const N = Number(matched.groups.N);
  const r = Number(matched.groups.r);
  const p = Number(matched.groups.p);
  const initializationVector = Buffer.from(matched.groups.initializationVector, 'base64');
  const encryptedText = matched.groups.encryptedText;

  const derivedKey = await scrypt(key, initializationVector, AES_256_CTR_KEY_LENGTH, {
    N,
    r,
    p,
  });

  const decipher = crypto.createDecipheriv(AES_256_CTR_ALGO_NAME, derivedKey, initializationVector);
  let decrypted = decipher.update(encryptedText, 'base64');
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

/**
 * Generates Key pair as a JsonWebKey (JWK).
 *
 * @param alg JWA Algorithm Identifier to be used with the generated key pair. @see https://www.rfc-editor.org/rfc/rfc7518.html
 * @returns {Promise<{publicKey: object, privateKey: object}>} The extractable key pair.
 */
async function generateJSONWebKeyPair({ alg = 'RS256' } = {}) {
  // Note: JOSE requires 2048 bits or larger for key size.
  const { publicKey, privateKey } = await jose.generateKeyPair(alg, {
    extractable: true,
    modulusLength: config.lti.jwkModulusLength,
  });
  const kid = crypto.randomUUID();
  const jwkPublicKey = await jose.exportJWK(publicKey);
  const jwkPrivateKey = await jose.exportJWK(privateKey);
  return {
    publicKey: { ...jwkPublicKey, kid },
    privateKey: { ...jwkPrivateKey, kid },
  };
}

/**
 * @typedef {Object} CryptoService
 * @property {function} randomBytes
 * @property {function} checkPassword
 * @property {function} decrypt
 * @property {function} encrypt
 * @property {function} hashPassword
 * @property {function} hashPasswordSync
 * @property {function} generateJSONWebKeyPair
 * @property {RegExp} phcRegexp
 */
const cryptoService = {
  randomBytes,
  checkPassword,
  decrypt,
  encrypt,
  hashPassword,
  hashPasswordSync,
  phcRegexp,
  generateJSONWebKeyPair,
};

export { cryptoService };
