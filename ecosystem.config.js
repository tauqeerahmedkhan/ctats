module.exports = {
  apps: [{
    name: 'attendance-tracker',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production'
    },
    time: true
  }]
}