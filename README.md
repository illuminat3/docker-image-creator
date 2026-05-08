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
