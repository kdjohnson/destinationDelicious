import React, { Component } from 'react';
import { StyleSheet, Text, View, ListView, ScrollView, Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import Emoji from 'react-native-emoji';
import ReportService from '../services/ReportService';
import ReportRow from './ReportRow';


class NearMe extends Component {

  static navigationOptions = {
    tabBar: {
      label: 'Carts Near Me'
    }
  }

  constructor(props) {
    super(props);

    this._reports = []

    // Create the initial state for component.
    this.state = {
      searchRadius: 1.60934,
      currentCoords: null,
      currentRegion: null,
      reports: this._reports,
      reportsDataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }),
      isListeningForReports: false
    }
  }

  componentWillMount() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let longitude = position.coords.longitude;
        let latitude = position.coords.latitude;
        this.setState({
          currentCoords: position.coords,
          currentRegion: {
            longitude: longitude,
            latitude: latitude,
            longitudeDelta: 0.1,
            latitudeDelta: 0.1 * ASPECT_RATIO
          }
        });
        this.query = ReportService.getReports({ longitude: this.state.currentCoords.longitude, latitude: this.state.currentCoords.latitude, radius: this.state.searchRadius }, (report) => {
          this.receiveReport(report);
        }, (report) => {
          this.removeReport(report);
        }, (report) => {
          console.log("Report Moved");
        });
      })
      navigator.geolocation.watchPosition((position) => {
        this.setCurrentCoords(position.coords);
      });
    } else {
      // User should be sent a message.
    }
  }

  /*
   * Used to set the value of [this.state.reports].
   */
  setReports(reports) {
    this._reports = reports;
    this.setState({
      reports: reports,
    }, () => this.setReportsDataSource(reports));
  }

 /*
  * Used to set the value of [this.state.reportsDataSource].
  */
  setReportsDataSource(reports) {
    this.setState({
      reportsDataSource: this.state.reportsDataSource.cloneWithRows(reports)
    });
  }

  /*
   * Add a report to the locally stored reports.
   */
  receiveReport(report) {
    this.setReports(this._reports.concat(report));
  }

  /*
   * Remove a locally stored report.
   */
  removeReport(report) {
    this.setReports(this._reports.filter((r) => r.id != report.id));
  }

  /*
   * Update a locally stored report by id.
   */
  updateReport(report) {
    this.setReports(this._reports.forEach((r) => {
      r = r.id == report.id ? report : r;
    }));
  }

  handleRegionChange(region) {
    this.setState({
      longitude: region.longitude,
      latitude: region.latitude,
      longitudeDelta: region.longitudeDelta,
      latitudeDelta: region.latitudeDelta * ASPECT_RATIO
    });
  }

  setCurrentCoords(coords) {
    this.setState({
      currentCoords: coords
    });

    if (this.query) {
      this.query.updateCriteria({
        radius: this.state.searchRadius,
        center: [coords.latitude, coords.longitude]
      });
    }
  }

  renderMapView(props) {
    if (this.state.currentRegion) {
      return <MapView
        key={(this.state.currentRegion).toString() + (this.state.reports).toString()}
        style={styles.map}
        initialRegion={this.state.currentRegion}
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={true}
        onRegionChangeComplete={(region) => {this.handleRegionChange(region)}}>
        {this.state.reports.map((report, i) => (
          <MapView.Marker
            key={i}
            title={report.name}
            coordinate={report}
            zIndex={0}>
            <View style={styles.marker}>
              {this.renderEmoji({emoji: report.foodtype})}
            </View>
          </MapView.Marker>
        ))}
        {this.renderSearchRadius()}
      </MapView>
    }
    return null;
  }

  renderSearchRadius(props) {
    let center = this.state.currentCoords;
    return <MapView.Circle
          key={(center.longitude + center.latitude).toString()}
          center={center}
          radius={this.state.searchRadius * 1000}
          strokeColor="rgb(85, 172, 238)"
          fillColor="rgba(85, 172, 238, 0.08)"
        />
  }

  renderEmoji({emoji}) {
      if (!emoji) {
          emoji = 'truck';
      }
      return <Emoji name={emoji} />
  }

  renderListView({ renderScrollComponent }) {
    if (this.state.reportsDataSource) {
      return <ListView
        key="list"
        dataSource={this.state.reportsDataSource}
        enableEmptySections={true}
        renderRow={(rowData) => (
          <ReportRow
            report={rowData}
            currentCoords={this.state.currentCoords} />
        )}
        renderScrollComponent={() =>
          renderScrollComponent
        }
      />
    }
    return null;
  }

  /*
   * Render a parallax scroll view with an optional 
   * [renderForground].
   */
  renderParallaxScrollView({ renderForeground }) {
    return <ParallaxScrollView
      parallaxHeaderHeight={PARALLAX_HEADER_HEIGHT}
      backgroundSpeed={10}
      fadeOutForeground={false}
      renderForeground={() =>
        renderForeground
      } />
  }

  render() {  

    if (!this.state.currentCoords) {
      return null;
    }

    return this.renderListView({ renderScrollComponent: this.renderParallaxScrollView({ renderForeground: this.renderMapView() }) });
  }
}

var currentRequest = null;

const PARALLAX_HEADER_HEIGHT = 300;

var { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  marker: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 3,
    shadowOpacity: 0.2
  }
});

module.exports = NearMe
