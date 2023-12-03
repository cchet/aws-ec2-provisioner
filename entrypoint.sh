#!/bin/bash

instanceCount=$(jq '.instanceCount' ${CONFIGURATION_DIR}/configuration.json)
callbackScript=${CONFIGURATION_DIR}/callback.sh

function create_ssh_key_pairs {
  if [[ "${instanceCount}" =~ ^[0-9]{1,2} ]]
  then
    if [ "${1}" != 'destroy' ]
    then
      echo "Generating ssh key-pairs for instanceCount '${instanceCount}'"
      counter=0
      while [[ counter -lt ${instanceCount} ]]; do
        sshFileName="${OUT_DIR}/id_rsa_${counter}"
        if [ -e "${sshFileName}" ] && [ -e "${sshFileName}.pub" ]
        then
          echo "Using existing ssh-key-pair '${sshFileName}'"
        else
          echo "Generating ssh key-pair for instance '${counter}'"
          ssh-keygen -t rsa -b 4096 -f "${sshFileName}" -q -N ''
        fi
        counter=$((counter + 1))
      done
    fi
  else
    echo "InstanceCount '${instanceCount}' is invalid, is the configuration.json mapped to '${CONFIGURATION_DIR}/configuration.json'"
  fi
}

function execute_callback {
  if [ -e "${callbackScript}" ]
  then
    echo "Executing callback script"
    eval "${callbackScript}"
  else
    echo "No callback script"
  fi
}

function cleanup {
  rm -rf ${OUT_DIR}/*
  echo "Cleaned directory '${OUT_DIR}'"
}

if [ "${1}" == 'deploy' ]
then
  create_ssh_key_pairs
  cdk deploy --require-approval never --outputs-file "${OUT_DIR}/training-info.json"
  execute_callback
elif [ "${1}" == 'destroy' ]
then
  cdk destroy --force
  cleanup
elif [ "${1}" == 'synth' ]
then
  create_ssh_key_pairs
  cdk synth
else
  echo "Only [deploy | destroy | synth] commands are supported, and you provided '${1}'"
  exit 1
fi