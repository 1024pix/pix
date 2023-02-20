export default async function getUserByResetPasswordDemand({
  temporaryKey,
  resetPasswordService,
  tokenService,
  userRepository,
}) {
  await tokenService.decodeIfValid(temporaryKey);
  const { email } = await resetPasswordService.verifyDemand(temporaryKey);
  return userRepository.getByEmail(email);
}
