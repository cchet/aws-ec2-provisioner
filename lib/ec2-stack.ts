import * as cdk from 'aws-cdk-lib';
import {CfnOutput} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as config from '../config/configuration.json';
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
import {
    EC2Instance,
    InstanceArrayConfiguration,
    InstanceConfiguration,
    isInstanceConfiguration,
    SingleEC2Instance
} from "./types";

const configuration: InstanceConfiguration | InstanceArrayConfiguration = config;

export class Ec2Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const count: number = (isInstanceConfiguration(configuration) ? (configuration as InstanceConfiguration).instance.count : (configuration as InstanceArrayConfiguration).instances.length);

        const subNets: SubnetConfiguration[] = this.emptyArray(count).map((_, idx) => this.createSubNet(idx));
        const vpc: Vpc = this.createVpc(subNets);
        const securityGroup: SecurityGroup = this.createSecurityGroup(vpc);
        const keyPairs: CfnKeyPair[] = this.emptyArray(count).map((_, idx) => this.createCfnKeyPair(idx));

        for (let i = 0; i < count; i++) {
            const configuredEC2Instance: EC2Instance | SingleEC2Instance = (isInstanceConfiguration(configuration) ? (configuration as InstanceConfiguration).instance : (configuration as InstanceArrayConfiguration).instances[i]);
            const instance = this.createInstance(i, configuredEC2Instance, vpc, securityGroup, keyPairs[i]);
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

    createInstance(idx: number, configuredEC2Instance: EC2Instance, vpc: Vpc, securityGroup: SecurityGroup, keyPair: CfnKeyPair) {
        const clazz: InstanceClass = InstanceClass[configuredEC2Instance.class.toUpperCase() as keyof typeof InstanceClass];
        const size: InstanceSize = InstanceSize[configuredEC2Instance.size.toUpperCase() as keyof typeof InstanceSize];
        if (!clazz || !size) {
            throw Error(`clazz and/or size have invalid values. clazz: ${configuredEC2Instance.class}, size: ${configuredEC2Instance.size}`);
        }
        const instance = new Instance(this, `${configuration.id}LinuxInstance${idx}`, {
            instanceName: `${configuration.id}LinuxEc2Instance${idx}`,
            machineImage: MachineImage.genericLinux(Object.fromEntries(new Map([
                [configuration.region, configuredEC2Instance.ami]
            ]))),
            instanceType: InstanceType.of(clazz, size),
            vpc: vpc,
            keyName: keyPair.keyName,
            securityGroup: securityGroup,
        });
        const bootstrapFile = `${process.env.CONFIGURATION_DIR}/bootstrap.sh`;
        if (fs.existsSync(bootstrapFile)) {
            instance.addUserData(fs.readFileSync(bootstrapFile, 'utf-8'));
        }

        return instance;
    }

    emptyArray(count: number): Array<number> {
        return Array(count).fill(0);
    }
}
