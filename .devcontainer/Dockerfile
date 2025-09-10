FROM node:22

# 1. Fix starship bug
# 2. Install curl, tree, locales
# 3. Install PostgreSQL client (psql)
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

WORKDIR /workspace
