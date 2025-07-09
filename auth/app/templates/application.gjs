import SignIn from 'auth/components/sign-in';
import pageTitle from 'ember-page-title/helpers/page-title';
import BannerContextual from 'auth/components/banner-contextual';
import Component from '@glimmer/component';
import PixAppLayout from "@1024pix/pix-ui/components/pix-app-layout";


export default class Application extends Component {
  get variant () {
    return this.args.model.clientId.split('-')[1];
  }
<template>
  {{pageTitle "Auth"}}

  <PixAppLayout @variant={{this.variant}}>
    <:navigation>
      <BannerContextual @context={{@model.clientId}} />
    </:navigation>
    <:main>
      <SignIn @model={{@model}} />
    </:main>
  </PixAppLayout>

  {{outlet}}
</template>


}
