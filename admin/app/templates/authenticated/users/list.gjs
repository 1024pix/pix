import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import FilterBanner from 'pix-admin/components/users/filter-banner';
import ListItems from 'pix-admin/components/users/list-items';
<template>
  {{pageTitle (t "pages.users-list.page-title")}}

  <h1>{{t "pages.users-list.main-title"}}</h1>

  <FilterBanner
    @idForm={{@controller.idForm}}
    @firstNameForm={{@controller.firstNameForm}}
    @lastNameForm={{@controller.lastNameForm}}
    @emailForm={{@controller.emailForm}}
    @usernameForm={{@controller.usernameForm}}
    @queryTypeForm={{@controller.queryTypeForm}}
    @refreshUsersList={{@controller.refreshUsersList}}
    @onChangeQueryType={{@controller.onChangeQueryType}}
    @queryTypes={{@controller.queryTypes}}
    @onChangeUserId={{@controller.onChangeUserId}}
    @onChangeFirstName={{@controller.onChangeFirstName}}
    @onChangeLastName={{@controller.onChangeLastName}}
    @onChangeEmail={{@controller.onChangeEmail}}
    @onChangeUsername={{@controller.onChangeUsername}}
    @clearSearchFields={{@controller.clearSearchFields}}
  />

  <ListItems
    @users={{@model}}
    @firstName={{@controller.firstName}}
    @lastName={{@controller.lastName}}
    @email={{@controller.email}}
    @username={{@controller.username}}
  />
</template>
