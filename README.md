# instance-manager
Instance scheduler for AWS with slack intergration

## Prerequisites

* Node.js v8.x
* serverless framework >= v1.27.0

Use `npm install -g serverless` to install serverless framework.

## Configuration

Make a copy of `_config.json` and rename to `config.json` .

Open `config.json` and edit it to meet your situation.

Here is the description for `config.json`.

TODO

## Deploy

Set your AWS credentials as environment variables.

```
export AWS_ACCESS_KEY_ID=<your-key-here>
export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
```

You can also set up AWS credentials in other ways. For advanced usage, refer to [the document of serverless framework](https://serverless.com/framework/docs/providers/aws/guide/credentials/) .

After setting up AWS credentials, you can use `sls deploy` to deploy to AWS.

## Slack intergration configuration

TODO
