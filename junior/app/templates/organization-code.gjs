import { PixButton, PixButtonLink, PixCode } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Footer from 'junior/components/footer';
import WidthLimitedContent from 'junior/components/width-limited-content';
<template>
  {{pageTitle (t "pages.home.page-title")}}

  <WidthLimitedContent>
    <form onSubmit={{@controller.goToSchool}} class="school-code">
      <div class="school-code__welcome-with-bubble">
        <div class="school-code__rotated-bubble">{{t "pages.home.beta"}}</div>
        <p class="school-code__welcome">{{t "pages.home.welcome"}}</p>
      </div>
      <p class="school-code__instructions">{{t "pages.home.code-instruction"}}</p>
      <div class="school-code__input">
        <PixCode
          @length="9"
          @requiredLabel={{t "common.forms.mandatory"}}
          @value={{@controller.schoolCode}}
          aria-label={{t "pages.home.code-description"}}
          {{on "input" @controller.handleCode}}
          class="school-code__pix-code"
        >
          <:label>{{t "pages.home.code-label"}}</:label>
        </PixCode>
      </div>

      <PixButton class="pix1d-button" @type="submit" @size="large">
        {{t "pages.home.go-to-school"}}
      </PixButton>
      <p>
        <strong>{{t "pages.home.not-any-code"}}</strong>
        <PixButtonLink @href="https://pix.fr/enseignement-primaire" target="_blank" @variant="tertiary">
          {{t "pages.home.ask-to-activate-organization"}}
        </PixButtonLink>
      </p>

      <div class="logos">
        <img src="/images/government-logo.svg" alt={{t "pages.home.government-logo-alt"}} class="logo" />
        <img src="/images/logo.svg" alt="Pix Junior" class="logo" />
      </div>
    </form>
    <Footer />
  </WidthLimitedContent>
</template>
