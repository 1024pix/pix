const validatePassword = require('../../infrastructure/validators/password-validator');
const { ObjectValidationError } = require('../errors');

async function resetPassword({
  temporaryKey,
  password,
  passwordResetService,
  encryptionService,
  userRepository,
  passwordResetDemandRepository,
}) {
  if (!validatePassword(password)) {
    throw new ObjectValidationError('Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.');
  }

  const [userId, hashedPassword] = await Promise.all([
    passwordResetService.extractUserIdFromTemporaryKey(temporaryKey),
    encryptionService.hashPassword(password),
  ]);

  await Promise.all([
    userRepository.updatePassword(userId, hashedPassword),
    passwordResetDemandRepository.markAsUsed(temporaryKey),
  ]);

  return true;
}

module.exports = resetPassword;
