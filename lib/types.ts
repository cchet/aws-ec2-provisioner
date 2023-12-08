export interface EC2Instance {
    ami: string,
    class: string,
    size: string,
}

export interface SingleEC2Instance extends EC2Instance{
    count: number
}

export interface BaseConfiguration {
    id: string,
    account: string,
    region: string,
}

export interface InstanceConfiguration extends BaseConfiguration {
    instance: SingleEC2Instance,
}

export interface InstanceArrayConfiguration extends BaseConfiguration {
    instances: EC2Instance[],
}

export const isInstanceConfiguration = (configuration: InstanceConfiguration | InstanceArrayConfiguration) => {
    return (configuration as InstanceConfiguration).instance !== undefined;
}