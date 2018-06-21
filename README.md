# savingway
Savingway is a serverless application aimed to save unnecessary cost of non-production environments on AWS by creating cron schedules to start & stop instances.
While creating hard schedules, savingway also provides flexible instance control interfaces.
You can combine it with Slack or even your own application.

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
