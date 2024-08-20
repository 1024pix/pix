import { LinkTo } from '@ember/routing';

import ActionsOnUsersRoleInOrganization from '../actions-on-users-role-in-organization';

<template>
  <td><LinkTo @route="authenticated.users.get" @model={{@organizationMembership.user.id}}>
      {{@organizationMembership.user.id}}
    </LinkTo></td>
  <td>{{@organizationMembership.user.firstName}}</td>
  <td>{{@organizationMembership.user.lastName}}</td>
  <td>{{@organizationMembership.user.email}}</td>
  <ActionsOnUsersRoleInOrganization @organizationMembership={{@organizationMembership}} />
</template>
