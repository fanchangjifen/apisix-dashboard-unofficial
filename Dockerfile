FROM node:18-alpine AS build
WORKDIR /build

# 使用pnpm
ARG DOCKER_NPM_MIRROR=https://registry.npmjs.org
RUN set -x \
  && npm config set registry ${DOCKER_NPM_MIRROR} \
  && npm install -g pnpm

# # 安装编译依赖
# ARG DOCKER_APK_MIRROR=dl-cdn.alpinelinux.org
# RUN set -x \
#   # 替换alpine镜像源
#   && sed -i "s@dl-cdn.alpinelinux.org@${DOCKER_APK_MIRROR}@g" /etc/apk/repositories \
#   && apk --no-cache --virtual build-dependencies add \
#     autoconf \
#     automake \
#     g++ \
#     make \
#     libpng-dev \
#     nasm \
#     libtool

# package没有变化则使用缓存的node_modules
COPY package.json /build/

# 安装npm依赖
RUN pnpm install

# 编译
COPY . /build/
ARG BUILD_MODE=build
RUN pnpm run ${BUILD_MODE}

# 打包
FROM scratch
COPY --from=build /build/dist /build
