const poolTime = (date = new Date()) => {
    const year = 364
    const startTime = Math.floor(date.getTime() / 1000)
    date.setDate(date.getDate() + year)
    const finishTime = Math.floor(date.getTime() / 1000)
    date.setDate(date.getDate() - year / 2)
    const cliffTime = Math.floor(date.getTime() / 1000) // half time
    return { startTime, cliffTime, finishTime }
}

module.exports = {
    poolTime
}
