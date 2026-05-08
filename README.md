# docker-image-creator

Cloudflare has a built in upload limit. This breaks docker registry uploads. To bypass this, this api will take a git repository and a path to a dockerfile and an image name to build the image and publish it to the registry.

## Environment variables

Copy `.env.example` to `.env` and fill in values.

| Variable            | Description                                     |
| ------------------- | ----------------------------------------------- |
| `PORT`              | Port to listen on (default: `3000`)             |
| `API_PASSWORD`      | Bearer token for API auth                       |
| `REGISTRY_URL`      | Registry hostname (e.g. `registry.example.com`) |
| `REGISTRY_USERNAME` | Registry login username                         |
| `REGISTRY_PASSWORD` | Registry login password                         |

## API

### `POST /build`

Clones repo, builds Docker image, pushes to registry configured in env.

#### **Headers**

| Header          | Value                   |
| --------------- | ----------------------- |
| `Authorization` | `Bearer <API_PASSWORD>` |
| `Content-Type`  | `application/json`      |

#### **Body**

| Field        | Type   | Required | Description                                |
| ------------ | ------ | -------- | ------------------------------------------ |
| `repo`       | string | yes      | HTTP/HTTPS URL of git repo                 |
| `imageName`  | string | yes      | Docker image name (e.g. `myapp:latest`)    |
| `dockerfile` | string | no       | Path to Dockerfile (default: `Dockerfile`) |

#### Example request

```json
{
  "repo": "https://github.com/user/myapp",
  "imageName": "myapp:latest",
  "dockerfile": "Dockerfile"
}
```

#### **Example response**

```json
{
  "success": true,
  "image": "registry.example.com/myapp:latest"
}
```

## GitHub Action

This repo ships as a reusable GitHub Action. Add it to any workflow to trigger a build without writing curl yourself.

### Inputs

| Input          | Required | Default      | Description                                                                |
| -------------- | -------- | ------------ | -------------------------------------------------------------------------- |
| `service-url`  | yes      | —            | Base URL of your docker-image-creator instance                             |
| `api-password` | yes      | —            | `API_PASSWORD` of your instance                                            |
| `image-name`   | yes      | —            | Docker image name to push (e.g. `myregistry/myimage:latest`)               |
| `repo`         | no       | current repo | Git repo URL to build from — defaults to the repo the action is running in |
| `dockerfile`   | no       | `Dockerfile` | Path to Dockerfile within the repo                                         |
| `timeout`      | no       | `600`        | Request timeout in seconds (10 minutes)                                    |

### Outputs

| Output  | Description           |
| ------- | --------------------- |
| `image` | The pushed image name |

### Usage

**Build the current repo (most common):**

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: illuminat3/docker-image-creator@main
        with:
          service-url: ${{ secrets.BUILDER_URL }}
          api-password: ${{ secrets.BUILDER_PASSWORD }}
          image-name: myregistry/myimage:latest
```

**Build a different repo:**

```yaml
- uses: illuminat3/docker-image-creator@main
  with:
    service-url: ${{ secrets.BUILDER_URL }}
    api-password: ${{ secrets.BUILDER_PASSWORD }}
    repo: https://github.com/other/repo
    image-name: myregistry/myimage:latest
    dockerfile: docker/Dockerfile.prod
```

**Use the output image name in a later step:**

```yaml
- uses: illuminat3/docker-image-creator@main
  id: build
  with:
    service-url: ${{ secrets.BUILDER_URL }}
    api-password: ${{ secrets.BUILDER_PASSWORD }}
    image-name: myregistry/myimage:${{ github.sha }}

- run: echo "Pushed ${{ steps.build.outputs.image }}"
```

### Secrets setup

Add these secrets to your repo under **Settings → Secrets and variables → Actions**:

| Secret             | Value                                          |
| ------------------ | ---------------------------------------------- |
| `BUILDER_URL`      | URL of your docker-image-creator instance      |
| `BUILDER_PASSWORD` | The `API_PASSWORD` from your instance's `.env` |
