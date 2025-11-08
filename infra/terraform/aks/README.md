# AKS Infrastructure with Terraform

This directory contains the Terraform configuration that provisions the Azure landing zone for the computer-vision asset management platform. Apply the configuration from here to create the network, AKS cluster, container registry, and supporting services.

## Directory Layout

- `versions.tf` & `providers.tf` – lock Terraform/provider versions and configure the AzureRM & Kubernetes providers.  
- `variables.tf` – shared tunables (region, node counts, naming prefix, etc.).  
- `main.tf` – actual Azure resources: resource group, virtual network/subnet, Log Analytics, AKS cluster, ACR, and role assignment.  
- `outputs.tf` – handy values extracted after apply (resource group name, kubeconfig, ACR login server).  

## Prerequisites

1. Azure CLI logged in (`az login`) and targeting the correct subscription.  
2. Service principal credentials exported for Terraform authentication:
   ```bash
   export ARM_SUBSCRIPTION_ID="988eb31a-f40c-4de3-90fa-3af31d69f254"
   export ARM_TENANT_ID="bd128032-3d53-410c-a307-e0e8c55b952a"
   export ARM_CLIENT_ID="ab28f2a9-91f9-4b41-a64e-11669194c19b"
   export ARM_CLIENT_SECRET="<replace-with-service-principal-password>"
   ```
3. Storage account created for remote state (already provisioned):  
   - `resource_group_name`: `rg-txdot-shared`  
   - `storage_account_name`: `sttxdotstate001`  
   - `container_name`: `tfstate`  
   - `key`: `aks.terraform.tfstate`

Export the storage account key before running `terraform init`:

```bash
export ARM_ACCESS_KEY="<storage-account-key>"
```

## Usage

```bash
cd infra/terraform/aks
terraform init
terraform plan -var="environment=dev"
terraform apply
```

Adjust `environment`, node counts, VM sizes, and Kubernetes version via `terraform.tfvars` or CLI `-var` overrides as you move from dev to staging/production.

> **Tip:** Keep all secrets (service principal password, storage account key) in a secure vault and load them into your shell only when running Terraform.


