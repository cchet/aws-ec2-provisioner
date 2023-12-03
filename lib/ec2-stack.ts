import * as cdk from 'aws-cdk-lib';
import {CfnOutput} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import configuration from '../config/configuration.json';
import * as fs from "fs";
import {
    CfnKeyPair,
    Instance,
    InstanceClass,
    InstanceSize,
    InstanceType,
    IpAddresses,
    MachineImage,
    Peer,
    Port,
    SecurityGroup,
    SubnetConfiguration,
    SubnetType,
    Vpc
} from "aws-cdk-lib/aws-ec2";

export class Ec2Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const subNets: SubnetConfiguration[] = this.emptyArray(configuration.instanceCount).map((_, idx) => this.createSubNet(idx));
        const vpc: Vpc = this.createVpc(subNets);
        const securityGroup: SecurityGroup = this.createSecurityGroup(vpc);
        const keyPairs: CfnKeyPair[] = this.emptyArray(configuration.instanceCount).map((_, idx) => this.createCfnKeyPair(idx));

        for (let i = 0; i < configuration.instanceCount; i++) {
            const instance = this.createInstance(i, vpc, securityGroup, keyPairs[i]);
            new CfnOutput(this, `instanceIP${i}`, {
                value: instance.instancePublicIp,
            });
            new CfnOutput(this, `instanceURI${i}`, {
                value: instance.instancePublicDnsName,
            });
        }
    }

    createSubNet(idx: number): SubnetConfiguration {
        return {
            name: `SubnetConfiguration${idx}`,
            cidrMask: 24,
            subnetType: SubnetType.PUBLIC,
            mapPublicIpOnLaunch: true,
        };
    }

    createCfnKeyPair(idx: number) {
        const keyPairName = `KeyPair${idx}`;
        return new CfnKeyPair(this, keyPairName, {
            keyName: keyPairName,
            publicKeyMaterial: fs.readFileSync(`${process.env.OUT_DIR}/id_rsa_${idx}.pub`, 'utf-8')
        });
    }

    createVpc(subNets: SubnetConfiguration[]) {
        return new Vpc(this, `${configuration.id}Vpc`, {
            vpcName: `${configuration.id}Vpc`,
            ipAddresses: IpAddresses.cidr("10.0.0.0/16"),
            enableDnsHostnames: true,
            enableDnsSupport: true,
            subnetConfiguration: subNets,
            maxAzs: 1,
        });
    }

    createSecurityGroup(vpc: Vpc) {
        const securityGroup = new SecurityGroup(this, `${configuration.id}SecurityGroup`, {
            vpc: vpc
        });
        securityGroup.addIngressRule(Peer.anyIpv4(), Port.allTraffic(), "Allow all inbound traffic");
        securityGroup.addEgressRule(Peer.anyIpv4(), Port.allTraffic(), "Allow all outbound traffic");

        return securityGroup;
    }

    createInstance(idx: number, vpc: Vpc, securityGroup: SecurityGroup, keyPair: CfnKeyPair) {
        return new Instance(this, `${configuration.id}LinuxInstance${idx}`, {
            instanceName: `${configuration.id}LinuxEc2Instance${idx}`,
            machineImage: MachineImage.genericLinux(Object.fromEntries(new Map([
                [configuration.region, configuration.ami]
            ]))),
            instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MEDIUM),
            vpc: vpc,
            keyName: keyPair.keyName,
            securityGroup: securityGroup,
        });
    }

    emptyArray(count: number): Array<number> {
        return Array(count).fill(0);
    }
}
