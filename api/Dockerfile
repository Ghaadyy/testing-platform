FROM debian:bullseye-slim as cmake

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git python3-pip

RUN pip install cmake

RUN git clone https://github.com/Ghaadyy/restricted-nl && \
    echo "Clone timestamp: $(date +%s)"

WORKDIR /restricted-nl
RUN cmake . && make

FROM mcr.microsoft.com/dotnet/sdk:8.0 as build

RUN apt-get update && \
    apt-get install -y nodejs npm

WORKDIR /app

COPY . /app/


RUN dotnet restore
RUN npm i websocket selenium-webdriver
RUN npm i -g mocha

RUN dotnet build

COPY --from=cmake /restricted-nl/librestricted_nl_lib.so /app/bin/Debug/net8.0/

EXPOSE 5064

CMD dotnet run