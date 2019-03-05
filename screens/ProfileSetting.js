import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
  ToastAndroid,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import Layout from "../constants/Layout";
import { LinearGradient, Font } from 'expo';
import { FontAwesome } from '@expo/vector-icons';
import * as actions from '../redux/action';
import CustomHeader from '../components/header';
import Intrest from '../components/intro/intrest'

class ProfileSettingScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };
  constructor(props){
    super(props)
    this.state={
      interest: []
    }
  }

  async componentWillMount(){
    await this.props.getCategoryRequest(); 
  }

  componentWillReceiveProps(nextProps){
    const { getCategoryData } = this.props;
    if (getCategoryData.status !== nextProps.getCategoryData.status){
      this.setState({interest:nextProps.getCategoryData.status.data})
    }
  }

  goBack = () => {
    const { navigation } = this.props;
    this.props.navigation.goBack();
  }

  selectInterests = (id) => {
    let int = this.state.interest;
    for (let index = 0; index < int.length; index++) {
      if(int[index]._id === id){
        if(int[index] !== undefined && int[index].selected){
          int[index]["selected"] = false ;
        }else {
          int[index]["selected"] = true ;
        }
      }
    }
    this.setState({interest:int})
  }

  render() {
    const { getCategoryData } = this.props;
    const { interest } = this.state;
    return (
      <View style={styles.mainContainer}>
        <CustomHeader
          isLeft
          leftIcon={'angle-left'}
          leftPress={this.goBack}
          isCenter={true}
          centerTitle={'Profile settings'}
        />    

        <View style={{flex:1,backgroundColor:'black'}} >
        <View style={{backgroundColor:'lightgray',height:Layout.window.height * 0.40}} >
          <View style={{height:Layout.window.height * 0.08,backgroundColor:'lightgray',justifyContent:'center'}} >
            <Text style={{margin:10,fontWeight:'500'}} > Interest </Text>
          </View>
          {
            interest &&
            <View style={styles.intrestContainer} >
            <View style={{flexDirection:'row',flexWrap:'wrap',margin:10}} >
              <FlatList
                  data={interest}
                  extraData={this.state}
                  keyExtractor={(item, index) => item.name}
                  numColumns={3}
                  style={styles.flatList}
                  renderItem={({item})=>{
                    let selected = item.selected !== undefined ? item.selected : false;
                    return(
                      <TouchableOpacity onPress={()=>{this.selectInterests(item._id)}}>
                          <LinearGradient
                            colors={selected?['#FF6CC9','#8559F0']:['rgba(255,255,255,0)','rgba(255,255,255,0)']}
                            style={{ flex: 1 }}
                            start={[0, 0]}
                            end={[1, 0]}
                            style={styles.bubbleContainer}
                            >
                            <Text style={[styles.bubbleText,selected?{color:'black'}:{color:'lightgray'}]} > {item.name} </Text>
                          </LinearGradient> 
                      </TouchableOpacity>
                    )
                  }}
                  />
            </View>
          </View>
          }
        </View>

        <View style={{backgroundColor:'lightgray',height:Layout.window.height * 0.20}} >
          <View style={{height:Layout.window.height * 0.08,backgroundColor:'lightgray',justifyContent:'center'}} >
            <Text style={{margin:10,fontWeight:'500'}} > Age </Text>
          </View>
            <View style={styles.intrestContainer} >
            <View style={{flexDirection:'row',flexWrap:'wrap',margin:10}} >                                
            {/* age */}
            </View>
          </View>
        </View>

        <View style={{backgroundColor:'lightgray',flex:1}} >
          <View style={{height:Layout.window.height * 0.08,backgroundColor:'lightgray',justifyContent:'center'}} >
            <Text style={{margin:10,fontWeight:'500'}} > Location </Text>
          </View>
            <View style={styles.intrestContainer} >
            <View style={{flexDirection:'row',flexWrap:'wrap',margin:10}} >
              <View style={styles.secondText}>
                <Text style={styles.kingstonText}>Kingston</Text>
                <View>
                  <Text style={styles.changText}>Change</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
          
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor:'lightgray'
  },
  secondText: {
    flex:1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  kingstonText: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 5
  },
  changText: {
    color: "#FF6CC9"
  },
  flatList:{
    flexDirection: 'column',
  },
  ageFlatList:{
    flexDirection: 'row',
  },
  bubbleText:{
    alignSelf:'center',
    textAlign:'center',
    fontSize:10,
    color:'#D8D8D8',
    fontWeight:'900'
  },
  intrestContainer:{
    // margin:10,
    flex:1,
    justifyContent:'space-between',
    backgroundColor:'white'
  },
  bubbleContainer:{
    borderWidth:1,
    margin:3,
    borderRadius:20,
    paddingRight:15,
    paddingLeft:15,
    borderColor:'#D8D8D8',
    height:40,
    alignItems:'center',
    justifyContent:'center'
  },
});

const mapStateToProps = (state) => {
  return {
      user: state.user,
      getCategoryData: state.getCategory,      
  }
}
const mapDispatchToProps = dispatch => 
    bindActionCreators(actions, dispatch);

export default connect(mapStateToProps,mapDispatchToProps)(ProfileSettingScreen);
    