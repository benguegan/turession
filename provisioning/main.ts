import { Instance } from '@cdktf/provider-aws/lib/instance';
import { KeyPair } from '@cdktf/provider-aws/lib/key-pair';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import {
  SecurityGroup,
  SecurityGroupIngress,
} from '@cdktf/provider-aws/lib/security-group';
import { App, TerraformOutput, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import * as fs from 'fs';

class MainStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, 'aws-provider', {
      region: 'us-east-1',
    });

    // const vpc = new Vpc(this, 'webserver-vpc', {
    //   cidrBlock: '10.0.0.0/16',
    // });

    const sshIngressRule: SecurityGroupIngress = {
      fromPort: 22,
      toPort: 22,
      cidrBlocks: ['0.0.0.0/0'],
      protocol: 'tcp',
    };

    const httpIngressRule: SecurityGroupIngress = {
      fromPort: 80,
      toPort: 80,
      cidrBlocks: ['0.0.0.0/0'],
      protocol: 'tcp',
    };

    const httpsIngressRule: SecurityGroupIngress = {
      fromPort: 443,
      toPort: 443,
      cidrBlocks: ['0.0.0.0/0'],
      protocol: 'tcp',
    };

    const webserverSG = new SecurityGroup(this, 'webserver-sg', {
      // vpcId: vpc.id,
      ingress: [sshIngressRule, httpIngressRule, httpsIngressRule],
      egress: [
        {
          fromPort: 0,
          toPort: 0,
          cidrBlocks: ['0.0.0.0/0'],
          protocol: '-1',
        },
      ],
    });

    const publicKey = fs.readFileSync(process.env.PUBLIC_KEY_FILEPATH!, 'utf8');

    const keyPair = new KeyPair(this, 'ec2-user', {
      publicKey,
    });

    const webserverInstance = new Instance(this, 'webserver', {
      ami: 'ami-02aead0a55359d6ec',
      instanceType: 't2.micro',
      vpcSecurityGroupIds: [webserverSG.id],
      keyName: keyPair.keyName,
      tags: {
        name: 'webserver',
      },
    });

    new TerraformOutput(this, 'public_ip', {
      value: webserverInstance.publicIp,
    });

    new TerraformOutput(this, 'security group ids', {
      value: webserverSG.id,
    });
  }
}

const app = new App();
new MainStack(app, 'webserver-stack');

app.synth();
