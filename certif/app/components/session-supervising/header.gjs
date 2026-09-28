import { PixButton, PixIcon, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import ConfirmationModal from 'pix-certif/components/session-supervising/confirmation-modal';

import dayjsUtcFormat from '../../helpers/dayjs-utc-format';

export default class Header extends Component {
  @service router;
  @service intl;
  @service url;
  @service featureToggles;

  @tracked modalDescriptionText;
  @tracked modalCancelText;
  @tracked modalConfirmationText = this.intl.t('common.actions.confirm');
  @tracked modalInstructionText = this.intl.t('pages.session-supervising.candidate-in-list.default-modal-title');
  @tracked isConfirmationModalDisplayed = false;

  get invigilatorDocumentationUrl() {
    return this.url.invigilatorDocumentationUrl;
  }

  @action
  askUserToConfirmLeaving() {
    this.modalDescriptionText = this.intl.t('pages.session-supervising.header.information');
    this.modalCancelText = this.intl.t('common.actions.cancel');
    this.modalConfirmationText = this.intl.t('pages.session-supervising.header.actions.confirmation');
    this.modalInstructionText = this.intl.t('pages.session-supervising.header.actions.exit-extra-information', {
      sessionId: this.args.session.id,
    });
    this.isConfirmationModalDisplayed = true;
  }

  @action
  closeConfirmationModal() {
    this.isConfirmationModalDisplayed = false;
  }

  @action
  actionConfirmation() {
    this.closeConfirmationModal();
    return this.router.replaceWith('login-session-invigilator');
  }

  <template>
    <div class='session-supervising-header'>
      <PixButton
        aria-label={{t 'pages.session-supervising.header.actions.exit-extra-information' sessionId=@session.id}}
        @size='small'
        @triggerAction={{this.askUserToConfirmLeaving}}
        @variant='secondary'
        @isBorderVisible='true'
        class='session-supervising-header__quit'
      >
        <PixIcon @name='logout' @ariaHidden={{true}} />
        {{t 'common.actions.exit'}}
      </PixButton>
      <h1 class='session-supervising-header__title'>{{t
          'pages.session-supervising.header.session-id'
          sessionId=@session.id
        }}</h1>
      <time class='session-supervising-header__date'>
        {{dayjsUtcFormat @session.date 'DD/MM/YYYY'}}
        ·
        {{dayjsUtcFormat @session.time 'HH:mm' inputFormat='HH:mm:ss' allowEmpty=true}}
      </time>

      <dl>
        <div class='session-supervising-header__line'>
          <dt class='session-supervising-header__label'>
            {{t 'pages.session-supervising.header.address'}}
          </dt>
          <dd>
            {{@session.address}}
          </dd>
        </div>
        <div class='session-supervising-header__line'>
          <dt class='session-supervising-header__label'>
            {{t 'pages.session-supervising.header.room'}}
          </dt>
          <dd>
            {{@session.room}}
          </dd>
        </div>
        <div class='session-supervising-header__line'>
          <dt class='session-supervising-header__label'>
            {{t 'pages.session-supervising.header.invigilator'}}
          </dt>
          <dd>
            {{@session.examiner}}
          </dd>
        </div>
        <div class='session-supervising-header__line'>
          <dt class='session-supervising-header__label'>
            {{t 'pages.session-supervising.header.access-code'}}
          </dt>
          <dd>
            {{@session.accessCode}}
          </dd>
        </div>
      </dl>

      <PixNotificationAlert @type='info' @withIcon={{true}}>
        {{t 'pages.session-supervising.header.invigilator-documentation.message'}}
        <a
          href={{this.invigilatorDocumentationUrl}}
          target='_blank'
          class='link session-supervising-header__invigilator-link'
          rel='noopener noreferrer'
        >
          {{t 'pages.session-supervising.header.invigilator-documentation.link'}}
          <PixIcon @name='openNew' @title={{t 'navigation.external-link-title'}} />
        </a>
      </PixNotificationAlert>

      <PixButton
        class='session-supervising-header__download-button'
        @variant='secondary'
        @isBorderVisible={{true}}
        @size='small'
        aria-label={{t 'pages.session-supervising.header.invigilator-kit.extra-information'}}
        @triggerAction={{@fetchInvigilatorKit}}
      >
        <PixIcon @name='download' @plainIcon={{true}} @ariaHidden={{true}} />
        {{t 'pages.session-supervising.header.invigilator-kit.label'}}
      </PixButton>

      <ConfirmationModal
        @showModal={{this.isConfirmationModalDisplayed}}
        @closeConfirmationModal={{this.closeConfirmationModal}}
        @actionOnConfirmation={{this.actionConfirmation}}
        @candidate={{this.candidate}}
        @modalCancelText={{this.modalCancelText}}
        @modalConfirmationButtonText={{this.modalConfirmationText}}
        @title='{{this.modalInstructionText}}'
      >
        <:description>
          {{this.modalDescriptionText}}
        </:description>
      </ConfirmationModal>

    </div>
  </template>
}
