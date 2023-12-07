FROM node:21.2.0-alpine3.18
ARG AWS_CDK_VERSION=2.111.0

RUN apk add --update --no-cache jq openssh-keygen \
    && npm install -g aws-cdk@${AWS_CDK_VERSION}

ENV EXECUTION_DIR /provision
ENV OUT_DIR /out
ENV JSII_SILENCE_WARNING_UNTESTED_NODE_VERSION=true
ENV CONFIGURATION_DIR "${EXECUTION_DIR}/config"
WORKDIR ${EXECUTION_DIR}

COPY . ./

RUN chmod 700 ./entrypoint.sh \
    && npm ci \
    && npm cache clean --force

VOLUME ["/root/.aws"]
VOLUME ["/provision/config"]

ENTRYPOINT ["/provision/entrypoint.sh"]

CMD ["synth"]