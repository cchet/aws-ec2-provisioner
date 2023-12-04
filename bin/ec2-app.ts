#!/usr/bin/env node
import 'source-map-support/register';
import {Ec2Stack} from '../lib/ec2-stack';
import configuration from '../config/configuration.json';
import {App, Tags} from "aws-cdk-lib";

const app = new App();
new Ec2Stack(app, `${configuration.id}Stack`, {
    env: {
        account: configuration.account,
        region: configuration.region
    }
});

Tags.of(app).add('id', configuration.id);
Tags.of(app).add('account', configuration.account);
Tags.of(app).add('region', configuration.region);

app.synth();