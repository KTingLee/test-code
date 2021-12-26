const Schedule = {
  actions: (parent, args, { actions }) => {
    return actions.filter(action => action.schedule === parent.id)
  }
}

module.exports = Schedule