## Modules

<dl>
<dt><a href="#module_OrganizationApi">OrganizationApi</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#MembershipNotFound">MembershipNotFound</a></dt>
<dd><p>Error representing a missing membership to an organization.</p>
</dd>
<dt><a href="#OrganizationMembership">OrganizationMembership</a></dt>
<dd><p>Model representing a membership to an organization.</p>
</dd>
</dl>

<a name="module_OrganizationApi"></a>

## OrganizationApi
<a name="module_OrganizationApi.getOrganizationMembership"></a>

### OrganizationApi.getOrganizationMembership(organizationId, userId) ⇒ [<code>Promise.&lt;OrganizationMembership&gt;</code>](#OrganizationMembership)
**Kind**: static method of [<code>OrganizationApi</code>](#module_OrganizationApi)  
**Throws**:

- [<code>MembershipNotFound</code>](#MembershipNotFound) 


| Param | Type |
| --- | --- |
| organizationId | <code>number</code> | 
| userId | <code>number</code> | 

<a name="MembershipNotFound"></a>

## MembershipNotFound
Error representing a missing membership to an organization.

**Kind**: global class  

