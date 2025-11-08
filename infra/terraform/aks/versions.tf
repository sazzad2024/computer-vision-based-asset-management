terraform {
  required_version = "~> 1.13.0"

  backend "azurerm" {
    resource_group_name  = "rg-txdot-shared"
    storage_account_name = "sttxdotstate001"
    container_name       = "tfstate"
    key                  = "aks.terraform.tfstate"
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.100, < 4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.32"
    }
  }
}


