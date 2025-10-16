FROM node:22

# Install curl, tree, locales, psql
#   - Locales are needed in order to fix a bug with starship command prompt
#   - curl and tree are just a useful utilities to have
#   - psql is the PostgreSQL command line client
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        locales \
        curl \
        tree \
        postgresql-client \
    ; \
    sed -i 's/# *en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen; \
    locale-gen en_US.UTF-8; \
    update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8; \
    rm -rf /var/lib/apt/lists/*

ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8

# Install starship prompt once, in the image
RUN curl -sS https://starship.rs/install.sh | sh -s -- --yes \
    && echo 'eval "$(starship init bash)"' >> /etc/bash.bashrc

# Install and enable pnpm 10.17.1 via Corepack
RUN corepack enable \
    && corepack prepare pnpm@10.17.1 --activate

# Set the default working directory where the source code will be mounted
# This is also set in devcontainer.json, but it's good to have it here too
WORKDIR /workspace

# Ensure node_modules and pnpm store exist and are owned by the node user
RUN mkdir -p /workspace/.pnpm-store /workspace/node_modules \
    && chown -R node:node /workspace/.pnpm-store /workspace/node_modules
