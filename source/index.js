#!/usr/bin/env node
import consumption from 'consumption'

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
    ({ total, usedPercentage, used, toBeRestoredString }) => {
      console.log(`Used data: ${used} (${usedPercentage}%) of ${total / 1024} GB - Resets: ${toBeRestoredString}`)
    }
  )
})
.catch(console.error.bind(null, `There was an error:\n`))
