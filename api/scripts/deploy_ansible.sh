#!/bin/bash -e

# Usage:
# ./deploy-infra.sh production

ENVIRONMENT=$1

if ! [[ -n $OS_AUTH_URL && -n $OS_TENANT_ID && -n $OS_TENANT_NAME && -n $OS_REGION_NAME && -n $OS_USERNAME && -n $OS_PASSWORD && -n $ENVIRONMENT ]]; then
  echo "Missing  Openstack vars (OS_AUTH_URL and OS_TENANT_ID and OS_TENANT_NAME and OS_REGION_NAME and OS_USERNAME and OS_PASSWORD) or environment=$ENVIRONMENT"
   exit 1
fi

#VARS
sgs="nodeapp"

# Create vault password
echo "$OS_PASSWORD" > vault_password

echo "add ssh to sg"
public_ip_address=$(wget -qO- http://checkip.amazonaws.com)

for sg in $sgs; do
   openstack security group rule create $sg --protocol tcp --dst-port 22:22 --remote-ip $public_ip_address/32 2>/dev/null || true
done

cd "$(dirname "$0")"/ansible

#Deploy app
ansible-playbook -i inventories/pix-$ENVIRONMENT deploy_app_prod.yml --vault-password-file=vault_password

#Disable ssh from circleci
echo "remove ssh to sg"
for sg in $sgs; do
    group_rule_id=$(openstack security group rule list $sg -f value | grep "$public_ip_address/32 22:22" | awk '{print $1;}' | head -1)
    openstack security group rule delete $group_rule_id 2>/dev/null || true
done

#Remove vault_password
rm vault_password
