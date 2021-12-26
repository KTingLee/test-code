const Query = {
  schedules: (patent, args, { schedules }) => schedules,
  actions: (patent, args, { actions }) => actions,
  schedule: (patent, args, { schedules }) => {
    return schedules.find(schedule => schedule.id === args.id)
  }
}

module.exports = Query