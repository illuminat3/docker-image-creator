# docker-image-creator
Cloudflare has a built in upload limit. This breaks docker registry uploads. To bypass this, this api will take a git repository and a path to a dockerfile and an image name to build the image and publish it to the registry.
