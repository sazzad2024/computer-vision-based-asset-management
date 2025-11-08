# Kubernetes Manifests

This folder hosts the raw manifests for deploying the TXDOT asset management stack on the `txdot-dev-aks` cluster.

## Components

- `namespace.yaml` – dedicated namespace `txdot-dev`
- `configmap-backends.yaml` – shared environment variables consumed by both backends
- `fastapi.yaml` – deployment + service for the detection API container
- `node-api.yaml` – deployment + service for the asset rating API
- `frontend.yaml` – deployment + load-balancer service exposing the React app

## Usage

```
# from repository root
export KUBECONFIG=$(pwd)/infra/terraform/aks/kubeconfig

kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/configmap-backends.yaml
kubectl apply -f infra/k8s/fastapi.yaml
kubectl apply -f infra/k8s/node-api.yaml
kubectl apply -f infra/k8s/frontend.yaml
```

Verify the rollout with:

```
kubectl get pods -n txdot-dev
kubectl get svc -n txdot-dev
```

Adjust replica counts, resource requests, and image tags as you promote to other environments. For production, replace the `LoadBalancer` service with an ingress controller and TLS termination as needed.


