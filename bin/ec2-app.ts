#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {Ec2Stack} from '../lib/ec2-stack';
import configuration from '../config/configuration.json';

const app = new cdk.App();
new Ec2Stack(app, `${configuration.id}Stack`, {
    env: {
        account: configuration.account,
        region: configuration.region
    }
});
app.synth();