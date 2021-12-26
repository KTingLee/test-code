const Action = {
  schedule: (parent, args, { schedules }) => {
    return schedules.find(schedule => schedule.id === parent.schedule)
  }
}

module.exports = Action