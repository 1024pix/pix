export async function authenticateLtiPrescriber({ organizationExternalIds, ltiPlatformRegisration, tokenService }) {
  const accessToken = tokenService.encodeToken()
  return accessToken;
}
