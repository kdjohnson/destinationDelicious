import * as firebase from 'firebase';

const geofire = require('geofire');
const geofireRef = new geofire(firebase.database().ref("geofire"))
const reportsRef = firebase.database().ref("reports")

/*
 * This will remove stale locations and reports
 * from the database
 */
reportsRef.on('value', function(data) {
  reportsRef.once("value")
  .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      // childData will be the actual contents of the child
      let childData = childSnapshot.val();

      //Go back 10 minutes
      staleness = Date.now() - 10 * 60 * 1000

      if(staleness > childData.timestamp ) {
        firebase.database().ref("reports/" + childSnapshot.key).remove()
        .then(function() {
          console.log("Remove report succeeded.")
          firebase.database().ref("geofire/" + childSnapshot.key).remove()
          .then(function() {
            console.log("Remove location succeeded.")
          })
          .catch(function(error) {
            console.log("Remove location failed: " + error.message)
          });
        })
        .catch(function(error) {
          console.log("Remove report failed: " + error.message)
        });
      }
    });
  })
  .catch(function(error) {
    console.log(error)
  });
});

class ReportService {

  /**
   * Adds a route object to the firebase database.
   * @param {Dict} report
   */
  static createReport(report) {
    var user = firebase.auth().currentUser
    var newReportKey = firebase.database().ref().child('reports').push().key;
    firebase.database().ref('reports/' + newReportKey).set({
      user: user.uid,
      name: report.name || "Unknown",
      description: report.description || "None",
      foodtype: report.foodtype || "other",
      longitude: report.longitude,
      latitude: report.latitude,
      timestamp: report.timestamp
    });

    // Add the report key and location to geofire so we can do lookups quickly
    geofireRef.set({ [newReportKey] : [report.latitude, report.longitude] }).then(function() {
      console.log("Report has been added to GeoFire");
    }, function(error) {
      console.log("Error: " + error);
    });
  }

  /**
   * Asynchronous updates the caller on reports within a radius of the provided location
   * @param {Dict} center
   * @param {Number} radius
   * @param {Function} added
   * @param {Function} moved
   * @param {Function} removed
   */
  static getReports(params, entered, exited, moved) {
    
    var geoQuery = geofireRef.query({
      center: [params.latitude, params.longitude],
      radius: params.radius
    });

    var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
      ReportService.getReport(key, function(report){
        entered(report)
      });
    });

    var onKeyEnteredRegistration = geoQuery.on("key_exited", function(key, location, distance) {
      ReportService.getReport(key, function(report){
        exited(report)
      });
    });

    var onKeyEnteredRegistration = geoQuery.on("key_moved", function(key, location, distance) {
      ReportService.getReport(key, function(report){
        moved(report)
      });
    });

    return geoQuery;
  }

  /**
   * Asynchronous returns a route object given an id
   * @param {String} id
   * @param {Function} callback
   */
  static getReport(id, callback) {
    firebase.database().ref('/reports/' + id).once('value').then(function(snapshot) {
      let report = snapshot.val();
      if (report) {
        report.id = id;
        callback(report);
      }
    });
  }
}

module.exports = ReportService
