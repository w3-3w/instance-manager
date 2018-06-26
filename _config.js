'use strict';

// This script is for building serverless.yml
// This is the config file for your savingway serverless application.
module.exports = () => ({
  // identifier for savingway to generate AWS resource names
  // Make it unique and recognizable for each of your savingway application.
  group: 'MY-ORGANIZATION',
  // If you are using AWS global account, keep it as "aws".
  // If you are using AWS China account, change it to "aws-cn".
  partition: 'aws',
  // region you want to deploy savingway to
  region: 'ap-northeast-1',
  // log of Lambda functions in CloudWatch expires after
  logRetentionInDays: 30,
  // AWS resource tag config
  tag: {
    // AWS resource which has the tag key will be managed by savingway
    // Savingway will NEVER and has NO permission to operate AWS resource that
    // doesn't have this tag key set.
    // Refer to "provider.iamRoleStatements" in serverless.yml to review IAM
    // role statements for savingway Lambda functions.
    key: 'savingway-managed',
    // AWS resource with the tag set to this value will be scheduled to start
    // and stop.
    scheduledValue: 'scheduled'
  },
  // CloudWatch Event
  event: {
    // If set to true, the initial status of rules will be enabled immediately
    // after deployment.
    // If set to false, you have to enable schedules manually through slack
    // commands.
    initiallyEnable: false,
    // EC2 schedules
    ec2: {
      // cron expression to start scheduled EC2 instances
      startCron: 'cron(30 0 ? * MON-FRI *)',
      // cron expression to stop scheduled EC2 instances
      stopCron: 'cron(30 12 ? * MON-FRI *)'
    },
    // RDS schedules
    rds: {
      // cron expression to start scheduled RDS instances
      startCron: 'cron(15 0 ? * MON-FRI *)',
      // cron expression to stop scheduled RDS instances
      stopCron: 'cron(45 12 ? * MON-FRI *)'
    }
  },
  // Slack integration
  slack: {
    // whether enable slack control or not
    // Savingway makes best efforts in security. Still, if you have security
    // concern and do not want to expose endpoint to Internet, you can set this
    // to false.
    // When set to false, no endpoint will be exposed to Internet and thus
    // operating through slack command functionality will not be available.
    enabled: true,
    // incoming webhook url for savingway to post messages to Slack
    incomingWebhookUrl: 'CHANGE-ME',
    // verification token for savingway to verify that request comes from your
    // slack command
    verificationToken: 'CHANGE-ME',
    // your Slack workspace team ID
    teamId: 'DUMMY',
    // channel ID that slack commands come from
    channelId: 'DUMMY',
    // permitted user ID to perform Slack commands
    // Join multiple IDs with comma.
    permittedUserIds: 'DUMMY1,DUMMY2'
  }
});
