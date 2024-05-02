import crypto from 'node:crypto';
import util from 'node:util';

import bcrypt from 'bcrypt';

import { config } from '../../../../src/shared/config.js';
import { PasswordNotMatching } from '../../../identity-access-management/domain/errors.js';

const randomBytes = util.promisify(crypto.randomBytes);
const scrypt = util.promisify(crypto.scrypt);

const phcRegexp =
  /^\$(?<algoDesc>[\w+-]+)\$N=(?<N>\d+)\$r=(?<r>\d+)\$p=(?<p>\d+)\$(?<initializationVector>[\w/+=-]+)\$(?<encryptedText>[\w/+=-]+)$/;

const key = config.authentication.secret;
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
  // eslint-disable-next-line no-sync
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
 * @returns {Promise<string>} an output in PHC format.
 *   Example: $scrypt+aes-256-ctr$N=8192$r=8$p=10$bsKRpytT0ocFpxmIlk/COw==$L0kaiHkLjrbD3C
 */
const encrypt = async function (text) {
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
 * @returns {Promise<string>} a decrypted text
 */
const decrypt = async function (phcText) {
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
 * @typedef {Object} CryptoService
 * @property {function} checkPassword
 * @property {function} decrypt
 * @property {function} encrypt
 * @property {function} hashPassword
 * @property {function} hashPasswordSync
 * @property {RegExp} phcRegexp
 */
const cryptoService = { checkPassword, decrypt, encrypt, hashPassword, hashPasswordSync, phcRegexp };

export { cryptoService };
