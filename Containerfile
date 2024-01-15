FROM node:21.2.0-bullseye-slim
ARG AWS_CDK_VERSION=2.111.0

RUN apt-get update -y \
    && apt-get install -y openssh-client  \
    && npm install -g aws-cdk@${AWS_CDK_VERSION} \
    && apt-get clean all

ENV EXECUTION_DIR /provision
ENV OUT_DIR /out
ENV JSII_SILENCE_WARNING_UNTESTED_NODE_VERSION=true
ENV CONFIGURATION_DIR "${EXECUTION_DIR}/config"
WORKDIR ${EXECUTION_DIR}

COPY . ./

RUN mv ./executor/target/executor-*-runner ./application \
    && chmod 777 ./application \
    && npm ci \
    && npm cache clean --force

VOLUME ["/root/.aws"]
VOLUME ["/provision/config"]

#ENTRYPOINT ["./application"]