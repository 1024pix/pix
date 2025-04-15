import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import MembersList from 'pix-orga/components/team/members-list';
<template>
  {{pageTitle (t "pages.team-members.title")}}
  <MembersList
    @members={{@model}}
    @onRemoveMember={{@controller.removeMembership}}
    @onLeaveOrganization={{@controller.leaveOrganization}}
  />
</template>
