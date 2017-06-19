#!/usr/bin/env node
const cli = require(`commander`)
const spinner = require(`ora`)
const { version } = require(`../../package`)
const consumption = require(`consumption`)
const table = require(`tty-table`)
const extractProperties = require(`deep-project`)(`
{
  msisdn,
  currentPriceplan {
    UnlimitedData,
    DisplayName
  }
  euBucket {
    consumed,
    leftToConsume,
    total
  }
  mainBucket {
    consumed,
    leftToConsume,
    total,
    unitString,
    toBeRestartedAtList
  }
}
`)

cli
  .version(version)
  .arguments(`<email> <password> [subscriptions...]`)
  .action(async (email, password, subscriptions) => {
    const loadingSpinner = spinner(`fetching data usage`).start()
    try {
      const dataBuckets = await consumption({ email, password, subscriptions })

      process.env.NODE_ENV === `development` &&
      console.log(JSON.stringify(dataBuckets, null, 2))

      loadingSpinner.stop()

      const buckets = dataBuckets.map(bucket => extractProperties(bucket))

      console.log(
        table(
          [
            { value: `Subscription` },
            { value: `Description` },
            { value: `Consumed / EU` },
            { value: `Remaining / EU` },
            { value: `Total / EU` }
          ],
          buckets.map(
            ({
              msisdn,
              currentPriceplan: { DisplayName, UnlimitedData },
              mainBucket: { consumed, leftToConsume, total, unitString },
              euBucket: { consumed: euConsumed, leftToConsume: euLeftToConsume, total: euTotal }
            }) =>
              UnlimitedData
                ? [
                  msisdn,
                  DisplayName,
                  `${consumed.toFixed(2)}${unitString} / ${euConsumed.toFixed(2)}${unitString}`,
                  `Unlimited / ${euLeftToConsume.toFixed(2)}${unitString}`,
                  `Unlimited / ${euTotal.toFixed(2)}${unitString}`
                ]
                : [
                  msisdn,
                  DisplayName,
                  `${consumed.toFixed(2)}${unitString} / ${euConsumed.toFixed(2)}${unitString}`,
                  `${leftToConsume.toFixed(2)}${unitString} / ${euLeftToConsume.toFixed(2)}${unitString}`,
                  `${total.toFixed(2)}${unitString} / ${euTotal.toFixed(2)}${unitString}`
                ]
          )
        ).render()
      )
    } catch (error) {
      loadingSpinner.fail(
        typeof (error) === `object` ? JSON.stringify(error) : error
      )
      process.exit()
    }
  })
  .parse(process.argv)

process.argv.length < 3 && cli.help()
