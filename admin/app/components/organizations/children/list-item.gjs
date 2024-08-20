import { LinkTo } from '@ember/routing';

<template>
  <tr aria-label={{@organization.name}}>
    <td>
      <LinkTo @route="authenticated.organizations.get" @model={{@organization.id}}>
        {{@organization.id}}
      </LinkTo>
    </td>
    <td>{{@organization.name}}</td>
    <td>{{@organization.externalId}}</td>
  </tr>
</template>
