import { PixButton, PixButtonLink } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ModuleObjectives from 'mon-pix/components/module/instruction/objectives';
import ModuleBetaBanner from 'mon-pix/components/module/layout/beta-banner';

<template>
  {{#if @module.isBeta}}
    <ModuleBetaBanner />
  {{/if}}

  <main class="module-recap">
    <div class="module-recap__header">
      <ButtonAction
        @redirectionUrl={{@module.redirectionUrl}}
        @iconAfter="doorOpen"
        @buttonText={{t "pages.modulix.recap.backToModuleDetails"}}
        @buttonClass="module-recap-header__icon"
        @variant="tertiary"
      />
    </div>

    <img class="module-recap__illustration" src="/images/modulix/recap-success.svg" alt="" width="228" height="200" />

    <h1 class="module-recap__title">{{t "pages.modulix.recap.title"}}</h1>

    <div class="module-recap__objectives">
      <p class="module-recap-objectives__subtitle">{{t "pages.modulix.recap.subtitle" htmlSafe=true}}</p>
      <ModuleObjectives @objectives={{@module.details.objectives}} />
    </div>

    <div class="module-recap__link-details">
      <ButtonAction
        @redirectionUrl={{@module.redirectionUrl}}
        @buttonText={{t "pages.modulix.recap.goToHomepage"}}
        @variant="primary"
      />
    </div>
  </main>
</template>

class ButtonAction extends Component {
  @service router;

  @action
  transitionToRedirectionUrl() {
    this.router.transitionTo(this.args.redirectionUrl);
  }

  get isRedirectionUrlInternal() {
    try {
      return Boolean(this.router.recognize(this.args.redirectionUrl));
    } catch {
      return false;
    }
  }

  <template>
    {{#if @redirectionUrl}}
      {{#if this.isRedirectionUrlInternal}}
        <PixButton
          @size="large"
          @variant={{@variant}}
          @iconAfter={{@iconAfter}}
          class={{@buttonClass}}
          @triggerAction={{this.transitionToRedirectionUrl}}
        >
          {{@buttonText}}
        </PixButton>
      {{else}}
        <PixButtonLink
          @size="large"
          @href={{@redirectionUrl}}
          @variant={{@variant}}
          @iconAfter={{@iconAfter}}
          class={{@buttonClass}}
        >
          {{@buttonText}}
        </PixButtonLink>
      {{/if}}
    {{else}}
      <PixButtonLink
        @size="large"
        @route="authenticated.user-dashboard"
        @variant={{@variant}}
        @iconAfter={{@iconAfter}}
        class={{@buttonClass}}
      >
        {{@buttonText}}
      </PixButtonLink>
    {{/if}}
  </template>
}
