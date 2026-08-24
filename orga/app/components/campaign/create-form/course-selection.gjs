import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { t } from 'ember-intl';
import { or } from 'ember-truth-helpers';

import CourseCard from '../../catalogue/course-card';
import FormField from '../../ui/form-field';
import PixFieldset from '../../ui/pix-fieldset';

<template>
  <FormField>
    <:default>
      <div class="campaign-creation-form__course-selection">
        <PixFieldset @required={{true}}>
          <:title>{{t "pages.campaign-creation.course-label"}}</:title>
          <:content>
            {{#if @campaign.course}}
              <CourseCard @course={{@campaign.course}} @type={{@campaign.course.type}} @isWide={{true}} />
            {{/if}}
            <PixButtonLink @route="authenticated.catalogue.list" @model={{@tab}} @variant="primary-bis">
              {{t "pages.campaign-creation.course-selection-label"}}
            </PixButtonLink>
          </:content>
        </PixFieldset>
      </div>
      {{#if (or @errors.targetProfile @errors.blueprint)}}
        <div class="form__error error-message">
          <span>{{t "api-error-messages.campaign-creation.target-profile-required"}}</span>
        </div>
      {{/if}}
    </:default>
  </FormField>
</template>
