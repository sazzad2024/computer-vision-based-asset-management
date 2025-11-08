variable "subscription_id" {
  description = "Azure subscription to deploy into."
  type        = string
  default     = "988eb31a-f40c-4de3-90fa-3af31d69f254"
}

variable "tenant_id" {
  description = "Azure AD tenant that owns the subscription."
  type        = string
  default     = "bd128032-3d53-410c-a307-e0e8c55b952a"
}

variable "prefix" {
  description = "Prefix applied to all resource names."
  type        = string
  default     = "txdot"
}

variable "environment" {
  description = "Deployment environment tag (e.g., dev, staging, prod)."
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region for the AKS workload."
  type        = string
  default     = "eastus"
}

variable "node_vm_size" {
  description = "VM SKU for the default AKS node pool."
  type        = string
  default     = "Standard_DC2s_v3"
}

variable "node_count" {
  description = "Number of nodes in the default node pool."
  type        = number
  default     = 2
}

variable "node_min_count" {
  description = "Minimum nodes when cluster autoscaler is enabled."
  type        = number
  default     = 1
}

variable "node_max_count" {
  description = "Maximum nodes when cluster autoscaler is enabled."
  type        = number
  default     = 4
}

variable "kubernetes_version" {
  description = "AKS control plane version."
  type        = string
  default     = "1.33.2"
}

variable "admin_group_object_ids" {
  description = "Optional Azure AD group object IDs granted cluster admin RBAC."
  type        = list(string)
  default     = []
}


