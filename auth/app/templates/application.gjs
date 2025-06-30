import SignIn from 'auth/components/sign-in';
import pageTitle from 'ember-page-title/helpers/page-title';

<template>
  {{pageTitle "Auth"}}
  <SignIn/>
  {{outlet}}
</template>
