FROM mcr.microsoft.com/dotnet/sdk:8.0

RUN apt-get update && apt-get install -y docker.io

# Use testing channel to use latest g++ compiler for rnlc
RUN echo "deb http://deb.debian.org/debian testing main" >> /etc/apt/sources.list

RUN apt-get update -y && apt-get upgrade -y && apt-get install -y g++ gcc

WORKDIR /app

ENV INSTALL_DIR=/usr/local/bin

# Determine the correct file name based on architecture
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        export FILE_NAME=build-linux-v1.1.1.tar.gz; \
    elif [ "$ARCH" = "aarch64" ]; then \
        export FILE_NAME=build-linux-arm64-v1.1.1.tar.gz; \
    else \
        echo "Unsupported architecture: $ARCH" && exit 1; \
    fi && \
    curl -L -o $FILE_NAME https://github.com/Ghaadyy/restricted-nl/releases/latest/download/$FILE_NAME && \
    tar -xzf $FILE_NAME -C $INSTALL_DIR && \
    rm $FILE_NAME && \
    mv /usr/local/bin/restricted_nl /usr/local/bin/rnlc

ENV PATH="${INSTALL_DIR}:$PATH"

WORKDIR /app/api

COPY testing-platform.csproj .
RUN dotnet restore

RUN dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

COPY . .

RUN dotnet build

EXPOSE 5064

CMD dotnet ef database update && dotnet run