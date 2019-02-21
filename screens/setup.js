import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
} from 'react-native';
import { WebBrowser, LinearGradient } from 'expo';

import CustomeButton from '../components/button';
import CustomHeader from '../components/header';
import Layout from '../constants/Layout';
import { MonoText } from '../components/StyledText';
import Intrest from '../components/intro/intrest'
import AgePicker from '../components/intro/age';
import Location from '../components/intro/location';
import Interest from '../Josn/Index';

export default class SetupScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props){
    super(props);
    this.state = {
      step: 1,
      interest:Interest
    }
  }
  selectInterests = (id) => {
    let int = this.state.interest;
    if(int[id] !== undefined && int[id].selected){
      int[id]["selected"] = false ;
    }else {
      int[id]["selected"] = true ;
    }
    this.setState({interest:int})
  }
  render() {
    const { step, interest } =this.state
    return (
      <View style={styles.container}>
        <CustomHeader
          step={step}
        />
        {
          step == 1 &&
          <Intrest 
            data={interest}
            onPress={()=>{ this.setState({step: step + 1}) }}
            selectInterests={(id)=>{this.selectInterests(id)}}
          />
        }
        {
          step == 2 &&
          <AgePicker 
            {...this.props}
            {...this.state}
            onPress={()=>{ this.setState({step: step + 1}) }}            
          />
        }
        {
          step == 3 &&
          <Location 
            {...this.props}
            {...this.state}
            onPress={()=>{ console.log('navigate') }}            
          />
        }
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container:{
    flex:1
  },
});
