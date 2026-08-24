import { PixIcon, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import CopyPasteButton from 'pix-orga/components/copy-paste-button';
import htmlUnsafe from 'pix-orga/helpers/html-unsafe';

<template>
  <PixNotificationAlert class="mission-list-banner" @type="communication-orga" @withIcon={{true}}>
    {{t "pages.missions.list.banner.welcome"}}
    <br />
    <ul>
      <li>
        {{#if @isAdmin}}
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
              <span>{{htmlUnsafe (t "pages.missions.list.banner.step2.option1" pixJuniorUrl=@pixJuniorUrl)}}
              </span>
              <div class="mission-list-banner__school-code">
                Code :&nbsp;<b>{{@schoolCode}}</b>
                <div class="copy-paste-button-container">
                  <CopyPasteButton
                    @clipBoardtext={{@schoolCode}}
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
                  (t "pages.missions.list.banner.step2.option2.body" pixJuniorUrl=@pixJuniorSchoolUrl code=@schoolCode)
                }}
                <a href={{@pixJuniorSchoolUrl}} target="_blank" rel="noopener noreferrer" id="external-link-icon">
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
</template>
