#!/usr/bin/env node
const cli = require(`commander`)
const { version } = require(`../../package`)
const consumption = require(`consumption`)
const Table = require(`tty-table`)
const main = require(`../index`)

cli.version(version)

cli
  .command(`get`)
  .description(`get consumption`)
  .option(`-e, --email [email address]`, `email address used to log in to Mitt Tele2`)
  .option(`-p, --password [password]`, `password used to log in to Mitt Tele2`)
  .option(`-s, --subscriptions [subscriptions]`, `choose specific subscription(s)`)
  .action(async ({ email, password, subscriptions }) => {
    try {
      const dataBuckets = await consumption(Object.assign(
        {},
        { email, password },
        subscriptions ? { subscriptions: subscriptions.split(`,`) } : []
      ))

      const buckets = dataBuckets.map(({
        msisdn,
        currentPriceplan: {
          unlimitedData,
          DisplayName
        },
        euBucket: {
          consumed: euDataConsumed,
          total: euDataTotal
        },
        mainBucket: {
          consumed,
          leftToConsume,
          total,
          unitString,
          toBeRestartedAtList
        }
      }) => ({
        msisdn,
        unlimitedData,
        DisplayName,
        euBucket: { consumed: euDataConsumed, total: euDataTotal },
        consumed,
        leftToConsume,
        total,
        unitString,
        toBeRestartedAtList
      }))
      console.log(JSON.stringify(buckets, null, 2))
    } catch (error) {
      console.log(error)
    }
  })

cli.parse(process.argv)

process.argv.length < 3 && cli.help()
