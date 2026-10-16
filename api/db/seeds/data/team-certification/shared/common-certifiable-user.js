import { createCertifiableProfile } from '../../common/tooling/profile-tooling.js';
import { CERTIFIABLE_SUCCESS_USER_ID } from './constants.js';

/**
 * Default Certification Pix App certifiable user
 *    - Pix Orga user   : certif-success@example.net
 */
export class CommonCertifiableUser {
  certifiableUsers = [];
  cleaEligibleUser;

  constructor({ databaseBuilder }) {
    this.databaseBuilder = databaseBuilder;
  }

  static async getInstance({ databaseBuilder }) {
    if (!this.instance) {
      this.instance = await new CommonCertifiableUser({ databaseBuilder }).#init();
    }

    return this.instance;
  }

  async #init() {
    for (let i = 0; i < 3; i++) {
      const user = this.databaseBuilder.factory.buildUser.withRawPassword({
        id: CERTIFIABLE_SUCCESS_USER_ID + i,
        firstName: ['Max', 'Maxime', 'Maxou'][i],
        lastName: 'Lagagne',
        email: `certif-success${i > 0 ? `-${i}` : ''}@example.net`,
        cgu: true,
        lang: 'fr',
        lastTermsOfServiceValidatedAt: new Date(),
      });

      await createCertifiableProfile({
        databaseBuilder: this.databaseBuilder,
        userId: user.id,
      });

      this.certifiableUsers = [...this.certifiableUsers, user];
    }
    this.cleaEligibleUser = this.databaseBuilder.factory.buildUser.withRawPassword({
      id: CERTIFIABLE_SUCCESS_USER_ID + 24,
      firstName: 'Jean',
      lastName: 'Lagagne',
      email: `certif-success-4@example.net`,
      cgu: true,
      lang: 'fr',
      lastTermsOfServiceValidatedAt: new Date(),
    });

    await createCertifiableProfile({
      databaseBuilder: this.databaseBuilder,
      userId: this.cleaEligibleUser.id,
    });

    return this;
  }
}
