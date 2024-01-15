#!/bin/sh

callbackScript=${CONFIGURATION_DIR}/callback.sh
instanceCount=$(jq '.instance.count' ${CONFIGURATION_DIR}/configuration.json)
if [ "${instanceCount}" == "null" ]
then
  instanceCount=$(jq -r '.instances | length' ${CONFIGURATION_DIR}/configuration.json)
fi

function create_ssh_key_pairs {
  if [[ "${instanceCount}" =~ ^[1-9]{1}[0-9]{0,} ]]
  then
    echo "Generating ssh key-pairs for instanceCount '${instanceCount}'"
    counter=0
    while [ $counter -lt ${instanceCount} ]
    do
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
  else
    echo "InstanceCount '${instanceCount}' is invalid, is the configuration.json mapped to '${CONFIGURATION_DIR}/configuration.json'"
    exit 1
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
  cdk deploy --require-approval never --outputs-file "${OUT_DIR}/info.json"
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