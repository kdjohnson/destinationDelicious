import React, { Component } from 'react';
import { Alert, AppRegistry, StyleSheet, Button, Text, TextInput, View, Image } from 'react-native';
import * as firebase from "firebase";
import AuthenticationService from '../services/AuthenticationService'

class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      confirmPassword: ''
    }
  }

  attemptLogin = () => {
    let email = this.state.username.toLowerCase()
    let pass = this.state.password
    let confirmPassword = this.state.confirmPassword

    // Check to make sure the passwords are the same length
    if (pass != confirmPassword) {
      Alert.alert('The passwords must be the same')
      return
    }

    // Authenticate with the email and password
    AuthenticationService.createUserWithEmailAndPassword(email, pass)
    .catch(function(error) {
      Alert.alert(error.message)
    })
  }

  goToSignUp = () => {
    this.props.verifyAuthState(false)
  }

  render() {
    return (
      <View style={ styles.container }>
        <TextInput keyboardType='email-address' autoCapitalize='none' style={ styles.email } value={ this.state.username } placeholder="Email" onChangeText={ (username) => this.setState({username}) } />
        <TextInput style={ styles.password } value={ this.state.password }  placeholder="Password" onChangeText={ (password) => this.setState({password}) } secureTextEntry={ true }/>
        <TextInput style={ styles.password } value={ this.state.confirmPassword }  placeholder="Confirm Password" onChangeText={ (confirmPassword) => this.setState({confirmPassword}) } secureTextEntry={ true }/>
        <Button onPress={ this.attemptLogin } title="Sign Up" color="#55acee"/>
        <View style={{ flexDirection: 'row' }}>
          <Text style={ styles.greyFont }>Already have an account?
            <Text onPress={ this.goToSignUp } style={ styles.yellowFont }> Sign In</Text>
          </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
     height: 300,
     width: 280,
     flexDirection: 'column',
     alignItems: 'center',
     paddingTop: 5
  },

  email: {
    alignSelf: 'stretch',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 3,
    height: 40,
    marginBottom: 10,
    paddingLeft: 10
  },

  password: {
    alignSelf: 'stretch',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 3,
    height: 40,
    marginBottom: 10,
    paddingLeft: 10
  },

  yellowFont: {
    color: "#55acee",
    fontWeight: 'bold'
  },

  greyFont: {
    marginTop: 10,
    height: 20,
    color: '#D8D8D8'
  }
});

module.exports = SignUp
