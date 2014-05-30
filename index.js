"use strict"

require("dotenv").load()
var auth = require("heroku-auth-finder")
var Heroku = require("heroku-client")
var redact = require("redact-url")
var flatten = require("flatten")
var client

var profiler = module.exports = function(app, token, cb) {

  // If api token is omitted, derive from env or netrc
  if (arguments.length === 2 && typeof(arguments[1]) === "function") {
    cb = token
    token = auth()
  }

  if (!app)
    throw new Error("app is required")

  if (!token)
    throw new Error("token is required")

  if (!cb)
    throw new Error("callback is required")

  client = Heroku.createClient({token: token})

  var res = {
    addons: [],
    env: {}
  }

  client.get("/apps/" + app + "/addons", function(err, addons) {
    if (err) return cb(err)

    var configVarsCreatedByAddons = flatten(addons.map(function(addon) {
      return addon.config_vars
    }))

    // Special case for Heroku Postgres
    configVarsCreatedByAddons.push("DATABASE_URL")

    res.addons = addons.map(function(addon) {
      return addon.plan.name
    })

    client.get("/apps/" + app + "/config-vars", function(err, vars) {
      if (err) return cb(err)
      var key, value
      for (key in vars) {
        value = vars[key]
        if (configVarsCreatedByAddons.indexOf(key) === -1) {
          // Redact things with secret-sounding names
          if (key.match(/secret|pass|token|key|pwd/i)) value = "REDACTED"
          res.env[key] = redact(value)
        }
      }
      return cb(null, res)
    })
  })
}
