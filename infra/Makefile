FQDN=pix-app.ovh

REMOTE_CMD=pssh -P --user ubuntu --host pix-app.ovh 
REMOTE_INSTALL_DIR=/home/ubuntu/install

renew-ssh:
	ssh-keygen -R $(FQDN) && ssh-keyscan -t rsa -H $(FQDN) >> ~/.ssh/known_hosts

provision-dokku:
	$(REMOTE_CMD) "mkdir -p $(REMOTE_INSTALL_DIR)"
	scp -r provision/ ubuntu@$(FQDN):$(REMOTE_INSTALL_DIR)/
	$(REMOTE_CMD) "for ffile in $(REMOTE_INSTALL_DIR)/??_*.sh ; do sudo bash -x $$ffile ; done"

install_dokku_client:
	wget https://raw.githubusercontent.com/dokku/dokku/v0.7.2/contrib/dokku_client.sh
	chmod +x ./dokku_client.sh
	echo "you can now use ./dokku_client.sh as a dokku client. (an alias could be smart)"

