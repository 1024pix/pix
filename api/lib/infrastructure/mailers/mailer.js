import Debug from 'debug';
import SendinblueProvider from './SendinblueProvider';
import { mailing } from '../../config';
import logger from '../logger';
import mailCheck from '../mail-check';
import EmailingAttempt from '../../domain/models/EmailingAttempt';

const debugEmail = Debug('pix:mailer:email');

class Mailer {
  constructor() {
    this._providerName = mailing.provider;

    switch (this._providerName) {
      case 'sendinblue':
        this._provider = new SendinblueProvider();
        break;
      default:
        logger.warn('Undefined mailing provider');
    }
  }

  async sendEmail(options) {
    debugEmail(options);
    try {
      await mailCheck.checkDomainIsValid(options.to);
    } catch (err) {
      logger.warn({ err }, `Email is not valid '${options.to}'`);
      return EmailingAttempt.failure(options.to, EmailingAttempt.errorCode.INVALID_DOMAIN);
    }

    if (!mailing.enabled) {
      return EmailingAttempt.success(options.to);
    }

    try {
      await this._provider.sendEmail(options);
    } catch (err) {
      logger.warn({ err }, `Could not send email to '${options.to}'`);
      return EmailingAttempt.failure(options.to);
    }

    return EmailingAttempt.success(options.to);
  }

  get accountCreationTemplateId() {
    return mailing[this._providerName].templates.accountCreationTemplateId;
  }

  get passwordResetTemplateId() {
    return mailing[this._providerName].templates.passwordResetTemplateId;
  }

  get organizationInvitationTemplateId() {
    return mailing[this._providerName].templates.organizationInvitationTemplateId;
  }

  get organizationInvitationScoTemplateId() {
    return mailing[this._providerName].templates.organizationInvitationScoTemplateId;
  }

  get certificationCenterInvitationTemplateId() {
    return mailing[this._providerName].templates.certificationCenterInvitationTemplateId;
  }

  get certificationResultTemplateId() {
    return mailing[this._providerName].templates.certificationResultTemplateId;
  }

  get emailChangeTemplateId() {
    return mailing[this._providerName].templates.emailChangeTemplateId;
  }

  get accountRecoveryTemplateId() {
    return mailing[this._providerName].templates.accountRecoveryTemplateId;
  }

  get emailVerificationCodeTemplateId() {
    return mailing[this._providerName].templates.emailVerificationCodeTemplateId;
  }

  get cpfEmailTemplateId() {
    return mailing[this._providerName].templates.cpfEmailTemplateId;
  }

  get acquiredCleaResultTemplateId() {
    return mailing[this._providerName].templates.acquiredCleaResultTemplateId;
  }
}

export default new Mailer();
