import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
} from 'react-native';
import { WebBrowser, LinearGradient } from 'expo';
import { FontAwesome ,EvilIcons } from '@expo/vector-icons';
import Layout from '../../constants/Layout';
import { MonoText } from '../../components/StyledText';
import CustomeButton from '../button'

export default class LoginContainer extends React.Component {
  render() {
    const { onPress, onChange, firstName, lastName, iconPress } = this.props;
    return (
      <View style={styles.container}>
      <TouchableOpacity onPress={iconPress} >
      <View>
      <FontAwesome
      name={'arrow-left'} size={20} style={{margin:5}} color="black" />
      </View>
      </TouchableOpacity>
       <View style={styles.labelContainer} >
          <Text style={styles.label} >Login </Text>
       </View>
       <View style={styles.inputContainer} >
          <View style={styles.inputBottomMargin} >
            <TextInput
            style={styles.textInput}
            value={firstName}
            onChangeText={(text)=>{ onChange(text,'email') }}            
            placeholder={'Email'}
            />
          </View>
          <View style={styles.inputBottomMargin} >
            <TextInput
            style={styles.textInput}
            value={lastName}
            secureTextEntry            
            onChangeText={(text)=>{ onChange(text,'password') }}
            placeholder={'Password'}
            />
          </View>

          <View style={{alignItems:'center',marginBottom:10}} >
            <CustomeButton
              buttonText={"Log in"}
              buttonSize={'small'}
              gradientColor={['#FF6CC9','#8559F0']}
              textColor={'white'}
              onPress={()=>{ onPress() }}
            />
          </View>
       </View>
       <View style={styles.signupContainer} >
          <View>
            <Text style={styles.signupLabel} >Sign in with </Text>
          </View>
          <View style={styles.imageContainer} >
            <Image
              style={styles.imageSize}
              source={require('../../assets/images/fbicon.png')}
            />
            <Image
              style={[styles.imageSize,styles.imageMargin]}
              source={require('../../assets/images/googleLogo.png')}
            />
            <Image
              style={[styles.imageSize,styles.imageMargin]}
              source={require('../../assets/images/instaIcon.png')}
            />
          </View>
       </View>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container:{
    flex:1,
    flexDirection:'column',
    justifyContent:'space-between',
    margin:20
  },
  labelContainer:{
    alignItems:'center',
    marginTop:10
  },
  label:{
    fontWeight:'600',
    fontSize:18
  },
  textInput:{
    borderBottomWidth:1,
    borderColor:'gray'
  },
  imageContainer:{
    marginLeft:40,
    flexDirection:'row'
  },
  imageSize:{
    height:25,
    width:25
  },
  imageMargin:{
    marginLeft:30
  },
  signupLabel:{
    fontSize:15,
    color:'gray'
  },
  inputContainer:{
    marginLeft:10,
    marginRight:10
  },
  inputBottomMargin:{
    marginBottom:30
  },
  signupContainer:{
    marginBottom:5,
    flexDirection:'row'
  }
});