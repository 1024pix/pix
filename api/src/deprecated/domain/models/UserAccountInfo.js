export class UserAccountInfo {
  #oidcAuthenticationMethods;
  #restrictedOidcProvidersForEmailCreation;

  constructor({
    id,
    email,
    username,
    canSelfDeleteAccount,
    restrictedOidcProvidersForEmailCreation = [],
    oidcAuthenticationMethods = [],
  }) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.canSelfDeleteAccount = canSelfDeleteAccount;
    this.#restrictedOidcProvidersForEmailCreation = restrictedOidcProvidersForEmailCreation;
    this.#oidcAuthenticationMethods = oidcAuthenticationMethods;
  }

  get canAddEmailConnectionMethod() {
    if (this.email) {
      return false;
    }
    if (this.#oidcAuthenticationMethods.length === 0) {
      return false;
    }
    if (this.#oidcAuthenticationMethods.length === 1) {
      const { identityProvider } = this.#oidcAuthenticationMethods.at(0);
      return !this.#restrictedOidcProvidersForEmailCreation.includes(identityProvider);
    }

    return true;
  }
}
