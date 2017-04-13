import React, { Component } from 'react';
import { StyleSheet, Text, View, Button} from 'react-native';
import * as firebase from 'firebase';

class AccountView extends Component {

  static navigationOptions = {
    title: 'Account View',
    header: {
      tintColor: '#fff',
      titleStyle: {
        color: '#fff'
      },
      style: {
        backgroundColor: '#55acee'
      },
      right: (
                <Button color='#55acee' title='Sign Out' onPress={() => state.params.signOut() }/>
                )
    }
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
      this.props.navigation.setParams({ signOut: this.signOut });
    }

 signOut() {
      firebase.auth().signOut()
    }

  render() {
    return (
      <View style={ styles.container }>
        <Text style={ styles.bigFont }>Account View Screen</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
     flexDirection: 'column',
     alignItems: 'center',
     paddingTop: 5
  },

  bigFont: {
    marginTop: 10,
    color: '#000000',
    fontSize: 30
  }
});

module.exports = AccountView