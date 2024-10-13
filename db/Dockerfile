FROM postgres:17.0

COPY init.sql /docker-entrypoint-initdb.d/

ENV POSTGRES_PASSWORD=postgres

EXPOSE 5432