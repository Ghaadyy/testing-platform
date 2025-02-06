FROM mcr.microsoft.com/dotnet/sdk:8.0

RUN apt-get update && apt-get install -y \
    docker.io \
    qemu-user-static \
    binfmt-support

# Use testing channel to use latest g++ compiler for rnlc
RUN echo "deb http://deb.debian.org/debian testing main" >> /etc/apt/sources.list

# QEMU is needed in case the host machine is arm64
# It can be resolved when we have an arm64 release of the compiler
RUN update-binfmts --enable qemu-x86_64 \
    && dpkg --add-architecture amd64 \
    && apt-get update -y \
    && apt-get upgrade -y \
    && apt-get install -y \
    g++:amd64 \
    gcc:amd64

WORKDIR /app

ENV INSTALL_DIR=/usr/local/bin
ENV FILE_NAME=build-linux-v1.1.0.tar.gz

RUN curl -L -o $FILE_NAME https://github.com/Ghaadyy/restricted-nl/releases/latest/download/$FILE_NAME

RUN tar -xzf $FILE_NAME -C $INSTALL_DIR && \
    rm $FILE_NAME && \
    mv /usr/local/bin/restricted_nl /usr/local/bin/rnlc

ENV PATH="${INSTALL_DIR}:$PATH"

WORKDIR /app/api

COPY fyp-backend.csproj .
RUN dotnet restore

RUN dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

COPY . .

RUN dotnet build

EXPOSE 5064

CMD dotnet ef database update && \
    dotnet run
    