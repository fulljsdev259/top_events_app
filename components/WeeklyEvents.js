import React, { Component, PureComponent } from "react";
import {
  Text,
  View,
  Dimensions,
  StyleSheet,
  FlatList,
  Image
} from "react-native";
import Index from "../Josn/Index";
import moment from "moment";
const { height, width } = Dimensions.get("window");
import Touch from 'react-native-touch';

export default class WeeklyEvents extends PureComponent {
  _renderItem = ({ item, index }) => {
    // let eventEndDate = moment(item.end).format("M") > moment(item.start).format("M") ||  (parseInt(moment(item.end).format("D")) !== parseInt(moment(item.start).format("D"))+1 && parseInt(moment(item.end).format("D")) > parseInt(moment(item.start).format("D"))+1 )? moment(item.end).format("D MMM") : "";
    let data = this.props.weeklyEventsData.weeklyEvents.data.results.length
    return (
        // <React.Fragment>
        // {(moment(item.start).format("D MMM") === moment().format('D MMM') || moment(item.start).format("D MMM") > moment().format('D MMM') ) &&
         <View
            key={index}
            style={[
            styles.cardWrapper,
            {
                marginRight:
                index == data  - 1 ? 23 : 7
            }
            ]}
        >
        <Touch onPress={() => this.props.onEventDescription(item)}>
            <View style={styles.imageWrapper}>
            <Image
                resizeMode={"cover"}
                style={styles.cardImage}
                source={
                item.image
                    ? { uri: item.image.secure_url }
                    : require("../assets/images/no-thumbnail.png")
                }
            />
            </View>
            <View style={styles.imageTitle}>
            <Text /* style={[ this.props.type == undefined ? styles.nameText : {color:'white'} ]} */>{item.title}</Text>
            <Text /* style={[ this.props.type == undefined ? styles.dateText : {color:'white'} ]} */>
            {/* {moment(item.start).format("D MMM ")+" "}{eventEndDate !=="" && ("-"+" " + eventEndDate)} */}
            Every {" "+ moment(item.start).format("dddd")}
            </Text>
            </View>
            </Touch>
        </View>
        // }
    //   </React.Fragment>
    // <Text>hello</Text>
    );
  };
  render() {
    const  {weeklyEventsData} =this.props;
    return (
        // <Text>hello</Text>
        
      <FlatList
        style={{ paddingLeft: 15 }}
        data={weeklyEventsData.weeklyEvents.data.results.sort(function(a,b){return new Date(a.start)-new Date(b.start)})}
        keyExtractor={(item, index) => item._id}
        renderItem={this._renderItem}
        horizontal={true}
        removeClippedSubviews={false}
        showsHorizontalScrollIndicator={false}
      />
    );
  }
}
const styles = StyleSheet.create({
  cardWrapper: {
    width: width * 0.6,
    flexDirection: "column",
    justifyContent: "flex-start"
  },
  imageWrapper: {
    width: "100%",
    height: height * 0.18
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 7
  },
  imageTitle: {},
  nameText: {},
  dateText: {
    color: "#808080"
  }
});
