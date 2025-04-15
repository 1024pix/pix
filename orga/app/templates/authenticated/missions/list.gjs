import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import eq from 'ember-truth-helpers/helpers/eq';
import CopyPasteButton from 'pix-orga/components/copy-paste-button';
import PageTitle from 'pix-orga/components/ui/page-title';
import htmlUnsafe from 'pix-orga/helpers/html-unsafe';
<template>
  {{pageTitle (t "pages.missions.title")}}

  <PixNotificationAlert class="mission-list-banner" @type="communication-orga" @withIcon={{true}}>
    {{t "pages.missions.list.banner.welcome"}}
    <br />
    <ul>
      <li>
        {{#if @model.isAdminOfTheCurrentOrganization}}
          <span>{{htmlUnsafe (t "pages.missions.list.banner.step1.admin.head")}}
            <LinkTo @route="authenticated.import-organization-participants">
              <b>{{t "pages.missions.list.banner.step1.admin.link"}}</b>
            </LinkTo>
            {{htmlUnsafe (t "pages.missions.list.banner.step1.admin.tail")}}
          </span>
        {{else}}
          <span>{{htmlUnsafe (t "pages.missions.list.banner.step1.non-admin")}}</span>
        {{/if}}
      </li>
      <li>
        <ul>
          {{t "pages.missions.list.banner.step2.title"}}
          <li>
            <div class="mission-list-banner__copypaste-container">
              <span>{{htmlUnsafe (t "pages.missions.list.banner.step2.option1" pixJuniorUrl=@controller.juniorUrl)}}
              </span>
              <div class="mission-list-banner__school-code">
                Code :&nbsp;<b>{{@controller.schoolCode}}</b>
                <div class="copy-paste-button-container">
                  <CopyPasteButton
                    @clipBoardtext={{@controller.schoolCode}}
                    @successMessage="{{t 'pages.missions.list.banner.copypaste-container.button.success'}}"
                    @defaultMessage="{{t 'pages.missions.list.banner.copypaste-container.button.tooltip'}}"
                  />
                </div>
              </div>
            </div>
          </li>
          <li>
            <div class="mission-list-banner__copypaste-container">
              <span>
                {{htmlUnsafe
                  (t
                    "pages.missions.list.banner.step2.option2.body"
                    pixJuniorUrl=@model.pixJuniorSchoolUrl
                    code=@controller.schoolCode
                  )
                }}
                <a href={{@model.pixJuniorSchoolUrl}} target="_blank" rel="noopener noreferrer" id="external-link-icon">
                  <PixIcon @name="openNew" />
                </a>
              </span>
              <span>
                {{htmlUnsafe (t "pages.missions.list.banner.step2.option2.hint")}}
              </span>
            </div>
          </li>
        </ul>
      </li>
      <li>
        <span>{{htmlUnsafe (t "pages.missions.list.banner.step3")}}</span>
      </li>
    </ul>
  </PixNotificationAlert>

  <PageTitle>
    <:title>{{t "pages.missions.title"}}</:title>
  </PageTitle>

  {{#if @model.missions}}
    <PixTable
      @variant="orga"
      @data={{@model.missions}}
      @caption={{t "pages.missions.list.caption"}}
      @onRowClick={{@controller.goToMissionDetails}}
    >
      <:columns as |mission context|>
        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.list.headers.name"}}</:header>
          <:cell>{{mission.name}}</:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.list.headers.competences"}}</:header>
          <:cell>{{mission.competenceName}}</:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.list.headers.started-by"}}</:header>
          <:cell>
            {{#if (eq mission.startedBy "")}}
              {{t "pages.missions.list.no-division"}}
            {{else}}
              {{mission.startedBy}}
            {{/if}}
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.list.headers.actions"}}</:header>
          <:cell>
            <PixButtonLink @route="authenticated.missions.mission" @model={{mission.id}} @variant="tertiary">
              {{t "pages.missions.list.actions.see-mission-details"}}
            </PixButtonLink>
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>

  {{else}}
    <div class="table__empty content-text">
      {{t "pages.missions.list.empty-state"}}
    </div>
  {{/if}}
</template>
