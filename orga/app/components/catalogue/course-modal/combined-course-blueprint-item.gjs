import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { t } from 'ember-intl';

<template>
  <PixBlock @variant="orga" class="combined-course-blueprint-item">
    <div class="combined-course-blueprint-item__icon">
      {{#if @item.iconUrl}}
        <img src={{@item.iconUrl}} alt="" />
      {{/if}}
    </div>
    <div class="combined-course-blueprint-item__content">
      <p class="pix-title-xxs">{{@item.name}}</p>
      <p class="combined-course-blueprint-item__description pix-body-xs">
        {{#if @item.isModule}}
          <span>
            {{t
              (if
                @item.isRecommendable
                "pages.catalogue.modal.combined-course-content.recommended"
                "pages.catalogue.modal.combined-course-content.prescribed"
              )
            }}
          </span>
        {{/if}}
        {{#if @item.duration}}
          <span class="combined-course-blueprint-item-duration">
            <PixIcon @name="acute" class="combined-course-blueprint-item-duration__icon" @ariaHidden={{true}} />
            <span
              aria-label={{t
                "pages.catalogue.modal.combined-course-content.aria-label-duration"
                duration=@item.duration
              }}
            >
              {{t "pages.catalogue.modal.combined-course-content.duration" duration=@item.duration}}
            </span>
          </span>
        {{/if}}
      </p>
    </div>
  </PixBlock>
</template>
