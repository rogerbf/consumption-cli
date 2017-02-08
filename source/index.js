#!/usr/bin/env node
import consumption from 'consumption'
import moment from 'moment'

consumption.tele2({
  username: process.argv[2] || process.env.TELE2USERNAME,
  password: process.argv[3] || process.env.TELE2PASSWORD
})
.then(data => {
  // {
  //   "consumption": {
  //     "listOfBuckets": [
  //       {
  //         "usedPercentage": 0,
  //         "leftToUsePercentage": 100,
  //         "used": "0,00 GB",
  //         "leftToUse": "100,00 GB",
  //         "description": "100 GB",
  //         "bucketType": 1,
  //         "unitString": "",
  //         "toBeRestoredString": "2017-03-01",
  //         "total": 102400,
  //         "showPercentage": true
  //       }
  //     ]
  //   }
  // }
  data.consumption.listOfBuckets.map(
    ({ total, leftToUsePercentage, usedPercentage, used, toBeRestoredString }) => {
      const gigabytes = total / 1024
      const daysFromNow = moment(toBeRestoredString).diff(moment(), `days`)
      const remainingDayRate = (gigabytes * (leftToUsePercentage / 100)) / daysFromNow
      console.log(`Data used: ${used} of ${gigabytes} GB (${usedPercentage}%) \u30FB ${daysFromNow} days until reset (${toBeRestoredString})`)

      remainingDayRate > 0 &&
      console.log(`Enough for a continued average use of: ${remainingDayRate.toString().replace(`.`, `,`)} GB/day`)
    }
  )
})
.catch(error => {
  process.stdout.write(`There was a problem connecting to Tele2\n`)
  process.env.DEBUG === `consumption` && console.log(error)
  process.exit()
})
