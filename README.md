# turession

## Execution 

### Step 1: Setup environment 
1. Setup the environment variables: 
```sh
export AWS_PROFILE=<profile>
export PUBLIC_KEY_FILEPATH=<public_key>
```

### Step 2: Provision the infrastructure

1. Go to the directory: `cd ./provisioning`
2. Install the project: `yarn install`
3. Deploy the infrastructure: `cdktf deploy`

### Step 3: Configure the webserver

1. Go to the directory: `cd ./configuration-manager`
2. Generate and list the dynamic inventory
```sh
ansible-inventory --list
```
3. Test the connection
```sh
ansible all -m ping
```
4. Configure the webserver
```sh
ansible-playbook webserver.yaml
```


