import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  ToastAndroid,
  Alert,
  Image,
  Platform,
  BackHandler,
} from "react-native";
import moment from 'moment';
import VideosComponent from "../../components/VideosComponent";
import EventYouMIghtLIke from '../../components/EventYouMIghtLIke';
import Events from "../../components/Events";
import MonthlyEvents from '../../components/MonthlyEvents';
import WeeklyEvents from '../../components/WeeklyEvents';
import PastEvents from '../../components/PastEvents';
import CustomHeader from ".././../components/header";
import { connect } from "react-redux";
const { height, width } = Dimensions.get("window");
import { getEventRequest,
  getAttendingEventRequest,   
  getCategoryRequest ,
  getStateAndCityRequest,
  getStateAndCityEventRequest, 
  getTodayEventRequest,
  getUserDataRequest,
  getEventByIdRequest,
  storeTokenRequest,
  getLikeEventRequest,
  getWeeklyEventsRequest,
  getPastEventsRequest,
} from "../../redux/action";
import Touch from 'react-native-touch';
import Layout from "../../constants/Layout";
import HomePageModal from '../../components/HomePageModal';
import {setItem,getItem} from '../../services/storage';
import ChangeLocation from '../../components/ChangeLocation';
import { WebBrowser, LinearGradient, Location, Permissions, Constants, Notifications } from 'expo';


class HomeTab extends Component {
  static navigationOptions = {
    header: null
  };
  constructor(props) {
    super(props);
    this.state = {
      isCategoryId: false,
      isStateAndCityId: false,
      changeLocationModal:false,
      interest:[],
      location: null,
      search:'',
      selected: false,
      stateCity:[],
      selectedInt:[],
      attendingEvents:'',
      attendingEventList:[],
      allCities:[],
      isComponent:false,
      likeLatestEventsLength:[],
      isToken:false
    };
  }

  async componentDidMount() {
    const getUpdatedInterest =await getItem('user_updated_interest')
    let getInterest;
    const getLocation = await getItem("user_info");
    if(getLocation && getLocation.location !== undefined && this.state.search != getLocation.location.name){
      this.setState({search:getLocation.location.name != undefined ? getLocation.location.name : '', selected: true}); 
    }
    let token =this.props.user.user.status.token
    if(getLocation && getLocation.location !== undefined){
      // this.setState({search:getLocation.location.name != undefined ? getLocation.location.name : '', selected: true}); 
    }
    if(getInterest && getInterest.interest != undefined ){
      if( getInterest.interest.length >0){
      getInterest.interest.forEach(eventId => {
        let id = eventId._id;
        let key = eventId.key;
        this.props.getEvent({ id, key });
      })
    } 
    }else{
      await this.props.getCategory();
    }
    this.props.getTodayEventRequest()
    await this.props.getAttendingEventRequest(token)
    await this.props.getLikeEventRequest({token:token});
    await this.props.getStateAndCity();
    await this.props.getPastEvents();
    await this.registerForPushNotificationsAsync();
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
}
 
 registerForPushNotificationsAsync = async () => {
  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  );
  let finalStatus = existingStatus;

  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== 'granted') {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  // Stop here if the user did not grant permissions
  if (finalStatus !== 'granted') {
    return;
  }

  // Get the token that uniquely identifies this device
  let token = await Notifications.getExpoPushTokenAsync();
  let userToken =this.props.user.user.status.token
  
  let payload = {
    token: userToken,
    data: {
      deviceToken:token
    }
  }
  this.props.storeTokenRequest(payload)
  // POST the token to your backend server from where you can retrieve it to send push notifications.
  
}

_handleNotification = (notification) => {
  };

  async componentDidUpdate(previousProps) {
    const getUpdatedInterest =await getItem('user_updated_interest')
    const getInterest =await getItem("user_interest")
    const getLocation = await getItem("user_info");
    const { getCategoryData ,getStateAndCityData,getEventData, user,userInterestBaseEvents} = this.props;
    if(user.user.status && user.user.status.token  && !this.state.isToken){
      let token  = user.user.status.token;
      await this.props.getUserDataRequest(token);
      this.setState({isToken:true})
    }
    
    if (getCategoryData.isSuccess && !this.state.isCategoryId) {
      
      getCategoryData.status.data.forEach(eventId => {
        let id = eventId._id;
        let key = eventId.key;
        this.props.getEvent({ id, key });
      });
      this.props.getTodayEventRequest()    
      await this.props.getWeeklyEvent();

      this.setState({ isCategoryId: true });
    }
    if(getStateAndCityData.isSuccess !==previousProps.getStateAndCityData.isSuccess){}
    if(getLocation && getLocation.location !== undefined && this.state.search != getLocation.location.name){
      this.setState({search:getLocation.location.name != undefined ? getLocation.location.name : '', selected: true}); 
    }
    if (getStateAndCityData.isSuccess && !this.state.isStateAndCityId && getLocation && getLocation.location !== undefined && user.user.data.data != undefined ) {
      this.props.getStateAndCityEvent({
        location:getLocation.location._id,
        userId: user.user.data.data._id
      });
      this.setState({ isStateAndCityId: true });
    }
    let allCities = []
    const {isComponent}=this.state;
      if(getStateAndCityData.isSuccess && getStateAndCityData.status && getStateAndCityData.status.data && !isComponent){
        getStateAndCityData.status.data.forEach((element,index)=>{
          element.cities.forEach((city,index)=>{
            allCities.push(city)
          })
        })
        this.setState({isComponent:true,allCities})
      }

      if(userInterestBaseEvents.isSuccess !== previousProps.userInterestBaseEvents.isSuccess){
       let likeLatestEventsLength=[]
        if(userInterestBaseEvents.isSuccess && userInterestBaseEvents.likeEvent && userInterestBaseEvents.likeEvent.data && userInterestBaseEvents.likeEvent.data.length >0){
          userInterestBaseEvents.likeEvent.data.forEach((element,index)=>{
            if((moment(element.start).format("MM") == moment().format('MM') || moment(element.start).format("MM") > moment().format('MM'))   && moment(element.start).format("D") > new Date().getDate()){
              likeLatestEventsLength.push(element)
            }
          })
          this.setState({likeLatestEventsLength})
        }
      }
  }
  
  onViewAll = async (category,categoryId) => {
    if(categoryId ==="pastevents"){
      this.props.navigation.navigate('ViewAllCard',{categoryId:"Past events"});
    }
    else{
      this.props.getEventById({id:category._id,key:category.key}) 
      this.props.navigation.navigate('ViewAllCard',{categoryId:categoryId});
    }
  };

  useCurrentLocation = async () => {
    const response = await Location.hasServicesEnabledAsync()
    if (!response) {
      this.setState({
        mapError: true,
      });
      if(Platform.OS == 'android') {
        ToastAndroid.showWithGravityAndOffset(
          'Please turn on your device location, to access this service',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50,
        );
      } else if( Platform.OS == 'ios'){ 
        Alert.alert(
          'Location Permission Denied',
          'Please turn on your device location, to access this service',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ],
          {cancelable: false},
        );
      }
    }else {
      let { status,error } = await Permissions.askAsync(Permissions.LOCATION);
      let location = await Location.getCurrentPositionAsync({enableHighAccuracy:true});
      this.getGeoAddress(location.coords.latitude, location.coords.longitude);
    }
  };

  findFilm(query) {
    if (query === '') {
      return [];
    }

    const { data } = this.props.getStateAndCityData.status;
    const {allCities}=this.state;
    const regex = new RegExp(`${query.trim()}`, 'i');
    return allCities.filter(city => city.name.search(regex) >= 0);
  }

  getGeoAddress = async (myLat,myLon) => {
    let response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + myLat + ',' + myLon + '&key=' + "AIzaSyBB7Tc7njRoyjegBDmqAVj09AKWbdRrTCI");
    const responses = await response.json();
    const results = responses.results
    let storableLocation = {};
    for (var ac = 0; ac < results[0].address_components.length; ac++) {
      var component = results[0].address_components[ac];

      switch (component.types[0]) {
        case "locality":
          storableLocation.city = component.long_name;
          break;
        case "administrative_area_level_1":
          storableLocation.state = component.long_name;
          break;
        case "country":
          storableLocation.country = component.long_name;
          storableLocation.registered_country_iso_code =
            component.short_name;
          break;
      }
    }
    let result = this.findFilm(storableLocation.state);
    if(result.length){
      this.setState({search:result[0].name})
    }else{
      this.setState({search:this.props.getStateAndCityData.status.data[0].name})
    }
  }
  onSearchChange = (text,val) => {
    this.setState({
      search: text,
      selected: val
    },()=>{
      if(val == false)
      this.onPressLocation()
    })
  }
  onPressLocation = async() => {
    const { search, selectedInt} = this.state;
    const { user } = this.props;
    if(!Object.keys(this.state.search).length){
      if(Platform.OS == 'android') {
        ToastAndroid.showWithGravityAndOffset(
          'Please add your location !!',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50,
        );
      } else if( Platform.OS == 'ios'){ 
        Alert.alert(
          'Add Location',
          'Please add your location !!',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ],
          {cancelable: false},
        );
      }
    } else {
      let filters = this.findFilm(search);
      let results;
      if(filters.length){
        if(search === "Kingston"){
          results = filters[1]
        }
        else{
          results = filters[0]
        }
        
        setItem("user_info", JSON.stringify({ location:results}));
        await this.props.getStateAndCityEvent({
          location:results._id,
          userId: user.user.data.data._id
        });
        // this.setState({changeLocationModal:false})
      }else {
        if(Platform.OS == 'android') {
          ToastAndroid.showWithGravityAndOffset(
            'Please add a correct location',
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50,
          );
        } else if( Platform.OS == 'ios'){ 
          Alert.alert(
            'Add Location',
            'Please add a correct location',
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {text: 'OK', onPress: () => console.log('OK Pressed')},
            ],
            {cancelable: false},
          );
        }
      }
    }
  }
  onCancelPress = () => {
    this.setState({search:'',selected:false},()=>{
      setItem("user_info", JSON.stringify({ location:''}));
    })
  }
  componentWillReceiveProps(nextProps){
    const {getStateAndCityData,getCategoryData} = this.props;
    const {attending,isLoading,joinedTrue} = this.props.getInterestedEvent    
    if(nextProps.getInterestedEvent.attending.data !== undefined && nextProps.getInterestedEvent.attending.data.results.length > 0 ){
      if(nextProps.getInterestedEvent.attending !== attending ){
        // if(this.state.attendingEventList.length !== nextProps.getInterestedEvent.attending.data.results)
          this.checkIn(nextProps.getInterestedEvent.attending);
      }    
    }
    if(getStateAndCityData.status !== nextProps.getStateAndCityData.status){
      this.setState({stateCity:nextProps.getStateAndCityData.status.data})
    }else if (getCategoryData.status !== nextProps.getCategoryData.status){
      this.setState({interest:nextProps.getCategoryData.status.data})
    }
  }

  checkIn = (attending) => {
    
    const { attendingEvents, attendingEventList } = this.state;
      attending.data.results.length > 0 && attending.data.results.map((events)=> {
        let diff = moment().diff(moment(events.start),'days')
        if(attendingEventList.length > 0) {
          let shownId = attendingEventList.find(id => id == events._id);
          if(shownId == -1 && attendingEvents == '' && diff == 0 ){
            attendingEventList.push(events._id);
            this.setState({
              attendingEvents: events,
              attendingEventList: attendingEventList
            })
          }
        } else {
          if(attendingEvents == '' && diff == 0 ){
            attendingEventList.push(events._id);
            this.setState({
              attendingEvents: events,
              attendingEventList: attendingEventList
            })
          }
        }
      })
  }

  onEventDescription = item => {
    this.props.navigation.navigate("CityEventDescription", { item: item });
  };
  _renderItem = ({ item, index }) => {
    let cetegoryId;
    let backgroundColor;
    if (Object.keys(item).join() === "shopping") {
      backgroundColor = "#8559F0";
    } else if (Object.keys(item).join() === "sports") {
      backgroundColor = "#FEEA3F";
    } else if (Object.keys(item).join() === "food") {
      backgroundColor = "#FF523E";
    } else if (Object.keys(item).join() === "conferences") {
      backgroundColor = "#00D5E4";
    } else if (Object.keys(item).join() === "health_wellness") {
      backgroundColor = "#00ED7C";
    } else {
      backgroundColor = "#FF6CC9";
    }
    return (
      <Events
        key={index}
        eventData={item[Object.keys(item).join()].data}
        categoryId={Object.keys(item).join()}
        backgroundColor={backgroundColor}
        onViewAll={(key,categoryId) => this.onViewAll(key,categoryId)}
        onEventDescription={this.onEventDescription}
      />
    );
  };

  removeCalanderItem = () => {
      this.setState({
        attendingEvents: '', 
      })
    }
  _keyExtractor = (item, index) => (index.toString());

  render() {
    const { changeLocationModal, attendingEvents,allCities, likeLatestEventsLength ,userInterestBaseEvents} = this.state;
    const {getStateAndCityData} = this.props;
    const eventsLength = this.props.getEventData.register.eventData.length;
    const events = this.props.getEventData.register.eventData;
    const thisWeekEvent = this.props.getEventData.register.todayEvent;
    // const weeklyEvents =this.props.getEventData
    const cityEvents = this.props.getStateAndCityEventData.status;
    const likeEvent = this.props.userInterestBaseEvents.likeEvent;
    const eventsForWeekly = this.props.weeklyEventsData.register.weeklyEvents
    return (
      <View style={styles.wrapper}>
        <CustomHeader isCenter={true} centerImage={true}  />
        {this.props.getEventData.register.isLoading == false ? (
          <ScrollView>
          {
            getStateAndCityData.status &&
            <ChangeLocation
              {...this.state} 
              changeLocationModal={changeLocationModal}
              stateAndCity={getStateAndCityData}
              useCurrentLocation={()=>{this.useCurrentLocation()}}
              onSearchChange={this.onSearchChange}
              onPress={()=>{this.onPressLocation()}}
              onCancelPress={this.onCancelPress}  
              closeModal={()=>{this.setState({changeLocationModal:false})}}
              allCities={allCities}
            />
          }
            <View style={styles.mainWrapper}>
              <View style={styles.kingstoneView}>
                <View style={styles.kingstoneTitle}>
                  <View>
                    <Text>Events Location</Text>
                  </View>
                  <View style={styles.secondText}>
                    <Text style={styles.kingstonText}>{this.state.search}</Text>
                    <TouchableOpacity onPress={()=>{this.setState({changeLocationModal:true})}}>
                      <View style={{flexDirection:'row', marginTop:3}} >
                        <Image
                          style={{width:20,height:20}}
                          resizeMode='cover'
                          source={require('../../assets/images/location.png')}
                        />
                        <View style={{margin:5}}/>
                        <Image
                          style={{width:65,height:20}}
                          resizeMode='cover'
                          source={require('../../assets/images/Change.png')}
                        />
                        {/* <View style={{margin:5}}/> */}
                      </View>
                    </TouchableOpacity>
                  </View>
                  {this.props.getStateAndCityEventData.status && 
                this.props.getStateAndCityEventData.status.data && 
                this.props.getStateAndCityEventData.status.data.results && 
                this.props.getStateAndCityEventData.status.data.results && 
                !this.props.getStateAndCityEventData.status.data.results.length &&
                <View><Text>
                  At This Time, There Are No Top Events In {this.state.search}.
                  </Text></View>}
                </View>
                
                {(eventsLength >0 && cityEvents !== undefined) && (
                  <VideosComponent
                    cityData={cityEvents}
                    onEventDescription={this.onEventDescription}
                  />
                )}
              </View>
              <View style={styles.likedView}>
                {
                  likeEvent && likeEvent.data && likeEvent.data.length>0  &&
                  <React.Fragment>
                    {likeLatestEventsLength.length > 0 &&
                       <View style={styles.EventTitleView}>
                      <Text style={styles.kingstonText}>Events you might like</Text>
                    </View>}
                    <EventYouMIghtLIke
                      cityData={likeEvent}
                      onEventDescription={this.onEventDescription}
                    />
                </React.Fragment>
                }
              </View>
              {
                thisWeekEvent.data && thisWeekEvent.data.length > 0 &&
                <LinearGradient
                colors={["#FF6CC9","#8559F0"]}
                style={{ flex: 1,justifyContent:'center' }}
                start={[0, 0]}
                end={[1, 0]}
                >
              <View style={{marginTop:15,marginBottom:15}}>
                <View style={{paddingLeft:15,marginBottom:10}}>
                  <Text style={styles.kingstonGradientText}>{moment().format('MMMM')} Events</Text>
                </View>
                {
                  thisWeekEvent.data  &&
                <MonthlyEvents
                  cityData={thisWeekEvent}
                  type="thisWeek"
                  onEventDescription={this.onEventDescription}
                  />
                }
              </View>
              </LinearGradient>
              }
              {this.props.weeklyEventsData.register.isSuccess && this.props.weeklyEventsData.register.weeklyEvents.data &&
              <View style={styles.likedView}>
                <View style={styles.EventTitleView}>
                  <Text style={styles.kingstonText}>Weekly Events</Text>
                </View>
                <WeeklyEvents
                  weeklyEventsData={this.props.weeklyEventsData.register}
                  type="thisWeek"
                  onEventDescription={this.onEventDescription}
                  />
              </View>}
              <View style={styles.eventComponentView}>
                {eventsLength > 0 && (
                  <FlatList
                    data={events.sort(function(a,b){return new Date(a.start)-new Date(b.start)})}
                    removeClippedSubviews={true}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                  />
                )
                }
              </View>
              {this.props.pastEvents.register.isSuccess && this.props.pastEvents.register.pastEvents.data &&
              this.props.pastEvents.register.pastEvents.data.length && 
              <View style={[styles.likedView,{paddingBottom:90}]}>
                <View style={styles.EventTitleViewForPast}>
                  <Text style={styles.kingstonText}>Past Events</Text>
                  <Touch activeOpacity={0.1} onPress={() => this.onViewAll(null,"pastevents")}>
                     <Text>View all {this.props.pastEvents.register.pastEvents.data.length} </Text>
                  </Touch>
                </View>
                <PastEvents
                  pastEvents={this.props.pastEvents.register}
                  type="pastEvents"
                  onEventDescription={this.onEventDescription}
                  />
              </View>}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.loaderView}>
            <ActivityIndicator color="#FF6CC9" size="large" />
          </View>
        )}
        {
          attendingEvents != '' &&
          <HomePageModal
            {...this.props}
            isOpen = {attendingEvents != '' ? true : false}
            title="This event is happening today"
            buttons={['Check in','Activity']}
            type="checkin"
            removeItem={this.removeCalanderItem}
            item={attendingEvents}
            />
        }
      </View>
    );
  }
}
const mapStateToProps = state => {
  return {
    user: state.user,
    getCategoryData: state.getCategory,
    getEventData: state.getEvent,
    getInterestedEvent: state.getInterestedEvent,
    getStateAndCityData: state.getStateAndCity,
    getStateAndCityEventData: state.getStateAndCityEvent,
    weeklyEventsData:state.weeklyEvents,
    pastEvents:state.pastEvents,
    userInterestBaseEvents:state.userInterestBaseEvents,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    getEvent: (eventId, eventKey) =>
      dispatch(getEventRequest(eventId, eventKey)),
    getAttendingEventRequest: (token) => dispatch(getAttendingEventRequest(token)),
    getCategory: () => dispatch(getCategoryRequest()),
    getUserDataRequest: (token) => dispatch(getUserDataRequest(token)),
    getStateAndCity:()=>dispatch(getStateAndCityRequest()),
    getTodayEventRequest: () => dispatch(getTodayEventRequest()),
    getStateAndCityEvent:(cityId)=>dispatch(getStateAndCityEventRequest(cityId)),
    getEventById:(eventId)=>dispatch(getEventByIdRequest(eventId)),
    storeTokenRequest: (payload) => dispatch(storeTokenRequest(payload)),
    getLikeEventRequest : (payload) => dispatch(getLikeEventRequest(payload)),
    getWeeklyEvent : (payload) => dispatch(getWeeklyEventsRequest(payload)),
    getPastEvents :()=>dispatch(getPastEventsRequest()),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeTab);

const styles = StyleSheet.create({
  wrapper: {
    // flexDirection:'column',
    // justifyContent:'center',
    // alignContent:'center'
  },
  mainWrapper: {
    flex: 1
  },
  kingstoneTitle: {
    flexDirection: "column",
    padding: 15
  },
  secondText: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  kingstonText: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 5
  },
  kingstonGradientText: {
    fontWeight: "bold",
    fontSize: 15,
    color:'white',
    marginBottom: 5
  },
  changText: {
    color: "#FF6CC9"
  },
  likedView: {
    marginTop: 30
  },
  EventTitleView: {
    paddingLeft: 15
  },
  EventTitleViewForPast:{
    paddingLeft: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 15
  },
  eventComponentView: {
    // paddingBottom: 90
  },
  loaderView: {
    position: "absolute",
    flex: 1,
    flexDirection: "column",
    alignSelf: "center",
    justifyContent: "center",
    alignContent: "center",
    top: height / 2.4
  }
});
