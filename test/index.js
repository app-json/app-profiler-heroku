"use strict"

require("dotenv").load()
var assert = require("assert")
var profiler = require("..")
var profile

describe("profiler", function() {

  before(function(done) {
    profiler("ord", function(err, p){
      profile = p
      done()
    })
  })

  it("returns an object", function() {
    assert.equal(typeof(profile), "object")
  })

  it("fetches addons", function() {
    assert(profile.addons)
  })

  it("fetches env", function() {
    assert(profile.addons)
  })

})
