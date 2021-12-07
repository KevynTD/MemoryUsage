import fs from 'fs'
import _ from 'lodash'
import path from 'path'

export class memoryUsage {
  constructor(configuration) {
    this.conf = {
      fileLocation: '',
      archiveName: 'memoryUsage',
      msPerSamples: 500,
      msBeforeEnd: 5000,
      onEndDelefeFile: true,
    }

    this.initialize = (conf) => {
      this.conf = { ...this.conf, ...conf }
      this.loopInterval = null
      this.logger = null

      // Archive
      const fileLocation = this.conf.fileLocation || path.resolve(path.dirname(''))
      this.pathArchiveData = path.resolve(fileLocation, this.conf.archiveName + '.json')

      // Debounces
      this.debouncedStartLog = _.debounce(this.startLog, this.conf.msBeforeEnd, { leading: true, trailing: false })
      this.debouncedEndLog = _.debounce(this.endLog, this.conf.msBeforeEnd, { leading: false, trailing: true })
    }
    this.initialize(configuration)

    this.debouncedInitialize = _.debounce(this.initialize, this.conf.msBeforeEnd, { leading: true, trailing: false })

    this.initialize(this.conf)
  }

  startLog(configuration) {
    if (configuration) this.initialize(configuration)

    // Create file
    fs.writeFileSync(this.pathArchiveData, '')

    // Init logger
    this.logger = fs.createWriteStream(this.pathArchiveData, { flags: 'a' })

    function getSamples(logger) {
      const memoryUsage = process.memoryUsage()
      logger.write(JSON.stringify(memoryUsage) + ',')
    }

    // Init loop
    this.loopInterval = setInterval(getSamples, this.conf.msPerSamples, this.logger)
  }

  endLog() {
    clearInterval(this.loopInterval)
    this.logger.end()

    const archive = fs.readFileSync(this.pathArchiveData)
    const data = archive.toString().slice(0, -1)
    const dataArray = JSON.parse(`[${data}]`)
    if (this.conf.onEndDelefeFile) fs.unlinkSync(this.pathArchiveData)

    const keys = ['rss', 'heapTotal', 'heapUsed', 'external', 'arrayBuffers']

    let min = {
      rss: Infinity,
      heapTotal: Infinity,
      heapUsed: Infinity,
      external: Infinity,
      arrayBuffers: Infinity,
    }

    let max = {
      rss: 0,
      heapTotal: 0,
      heapUsed: 0,
      external: 0,
      arrayBuffers: 0,
    }

    let sum = {
      rss: 0,
      heapTotal: 0,
      heapUsed: 0,
      external: 0,
      arrayBuffers: 0,
    }

    dataArray.forEach((sample) => {
      keys.forEach((ramType) => {
        const currRam = sample[ramType] / 1000000
        if (currRam < min[ramType]) min[ramType] = currRam
        if (currRam > max[ramType]) max[ramType] = currRam
        sum[ramType] += currRam
      })
    })

    let totalRecord = dataArray.length
    let avg = {
      rss: sum.rss / totalRecord,
      heapTotal: sum.heapTotal / totalRecord,
      heapUsed: sum.heapUsed / totalRecord,
      external: sum.external / totalRecord,
      arrayBuffers: sum.arrayBuffers / totalRecord,
    }

    const result = { min, max, avg }

    console.log(this.conf.archiveName, result)
    // fs.writeFileSync(this.pathArchive, JSON.stringify(result, null, '\t'))
  }

  autoStartAndEnd(configuration) {
    if (configuration) this.debouncedInitialize(configuration)
    this.debouncedStartLog()
    this.debouncedEndLog()
  }
}

export const memoryUsageInstance = new memoryUsage()


