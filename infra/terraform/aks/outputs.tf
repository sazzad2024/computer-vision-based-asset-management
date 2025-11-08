output "resource_group_name" {
  description = "The resource group that hosts the AKS infrastructure."
  value       = azurerm_resource_group.aks.name
}

output "kube_config" {
  description = "Raw kubeconfig for kubectl (sensitive)."
  value       = azurerm_kubernetes_cluster.aks.kube_config_raw
  sensitive   = true
}

output "acr_login_server" {
  description = "Container registry login server URL."
  value       = azurerm_container_registry.acr.login_server
}

output "aks_identity_principal_id" {
  description = "Managed identity principal ID for AKS control plane."
  value       = azurerm_kubernetes_cluster.aks.identity[0].principal_id
}


