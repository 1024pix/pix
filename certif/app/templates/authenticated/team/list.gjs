import { PixButton, PixButtonLink, PixIcon, PixTabs } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import not from 'ember-truth-helpers/helpers/not';
import MembersList from 'pix-certif/components/members-list';
import SelectRefererModal from 'pix-certif/components/select-referer-modal';

<template>
  {{pageTitle (t 'pages.team.title')}}

  <div class='team__header'>
    <h1 class='page-title'>{{t 'pages.team.title'}}</h1>
    <div class='team__header-admin-buttons'>
      {{#if @controller.shouldDisplayUpdateRefererButton}}
        <PixButton @variant='secondary' @isBorderVisible={{true}} @triggerAction={{@controller.toggleRefererModal}}>{{t
            'pages.team.update-referer-button'
          }}</PixButton>
      {{/if}}
      {{#if @controller.shouldDisplayInviteMemberButton}}
        <PixButtonLink @route='authenticated.team.invite'>{{t 'pages.team.invite-button'}}</PixButtonLink>
      {{/if}}
    </div>
  </div>

  {{#if @controller.shouldDisplayNoRefererSection}}
    <div class='panel team__no-referer-container'>
      <div class='team__no-referer-container-grey'>
        <PixIcon @name='bell' @plainIcon={{true}} @ariaHidden={{true}} class='team__no-referer-icon' />
        <div>
          <h2 class='team__no-referer-title'>
            {{t 'pages.team.no-referer-section.title'}}
          </h2>
          <p class='team__no-referer-description'>
            {{t 'pages.team.no-referer-section.description'}}
          </p>

          <PixButton @triggerAction={{@controller.toggleRefererModal}}>
            {{t 'pages.team.no-referer-section.select-referer-button'}}
          </PixButton>
        </div>
      </div>
    </div>
  {{/if}}

  {{#if @controller.shouldDisplayNavbarSection}}
    <PixTabs @variant='certif' @ariaLabel={{t 'pages.team.tabs.aria-label'}} class='team__tabs'>
      <LinkTo @route='authenticated.team.list.members'>
        {{t 'pages.team.tabs.member' count=@model.members.length}}
      </LinkTo>
      <LinkTo @route='authenticated.team.list.invitations'>
        {{t 'pages.team.tabs.invitation' count=@model.invitations.length}}
      </LinkTo>
    </PixTabs>
    {{outlet}}

  {{else}}
    <MembersList @members={{@model.members}} @hasCleaHabilitation={{@model.hasCleaHabilitation}} />
  {{/if}}

  <SelectRefererModal
    @showModal={{@controller.shouldShowRefererSelectionModal}}
    @toggleRefererModal={{@controller.toggleRefererModal}}
    @onSelectReferer={{@controller.onSelectReferer}}
    @onValidateReferer={{@controller.onValidateReferer}}
    @noSelectedReferer={{not @controller.selectedReferer.length}}
    @options={{@controller.membersSelectOptionsSortedByLastName}}
    @selectedReferer={{@controller.selectedReferer}}
  />
</template>
