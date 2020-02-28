// Be sure to checkout this page for react-native-swipeout components
//  https://github.com/CandyOgre/react-native-swipeout
//
// Use the following command to install react-native-switpeout
//    yarn add git+https://github.com/CandyOgre/react-native-swipeout.git
//
import React, { Component, PureComponent } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { sendEmail, phoneCall, getDirection } from '../../api/communications';
import styles, { colors } from './Panel.styles';
import Button from '../../components/Button';
import BackgroundImage from '../../components/BackgroundImage';
import { getDistance } from '../../api/geolocation';
import Swipeout from '../../components/SwipeOut';
import SideButton from '../../components/Button/SideButton';

export default class Panel extends PureComponent {
    static propTypes = {
        id: PropTypes.string,
        index: PropTypes.number,
        data: PropTypes.object.isRequired,
        close: PropTypes.bool,
        longitude: PropTypes.number,
        latitude: PropTypes.number,
        onPressItem: PropTypes.func,
    };

    static defaultProps = {
        data: {},
        close: false,    // bool to trigger close
    }

    constructor (props) {
        super(props);
        this.state = {
            opened: false,
        };
        this.swipeOutRef = null;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.close) {
            this.setState({ opened: false });
        }
    }

    linkPhone = () => {
        const { data: { phone } } = this.props;
        phoneCall(phone, true);
    }

    linkDirection = () => {
        const { data: { coordinate }, longitude, latitude } = this.props;

        getDirection(latitude, longitude, coordinate.latitude, coordinate.longitude);
    }


    _onPress = () => {
        this.props.onPressItem(this.props.id, this.props.index);
    };

    get renderRating () {
        const { data: {rating, review_count} } = this.props;

        var icon =  rating <= 0.5 ? require('../../assets/0_stars.png') :
                    rating == 1 ? require('../../assets/1_stars.png') :
                    rating == 1.5 ? require('../../assets/1_5_stars.png') :
                    rating == 2 ? require('../../assets/2_stars.png') :
                    rating == 2.5 ? require('../../assets/2_5_stars.png') :
                    rating == 3 ? require('../../assets/3_stars.png') :
                    rating == 3.5 ? require('../../assets/3_5_stars.png') :
                    rating == 4 ? require('../../assets/4_stars.png') :
                    rating == 4.5 ? require('../../assets/4_5_stars.png') :
                    rating == 5 ? require('../../assets/5_stars.png') :
                    review_count > 0 ? require('../../assets/0_stars.png') : null;

        if (review_count) {
            return (
                <View style={styles.rating}>
                    <BackgroundImage style={styles.rating_image} source={icon}/>
                    <Text style={[styles.subtitle, {alignSelf: 'flex-end', textAlign:'right'}]}>
                        {` ${review_count}` + ' reviews'}</Text>
                </View>
            );
        }
    }

    get renderHours () {
        const { data: { is_open_now, is_24_hours } } = this.props;

        if (is_24_hours && is_open_now) {
            return (
                <Text style={[styles.subtitle, {textAlign:'right'}]}>{'24 hrs, open now'}</Text>
            )
        } else if (is_open_now) {
            return (
                <Text style={[styles.subtitle, {textAlign:'right'}]}>{'open now'}</Text>
            )
        }
    }

    render () {
        const { data:
            { name, title, phone, email, coordinate } } = this.props;

        const distance = getDistance(this.props.longitude, this.props.latitude,
                                     coordinate.longitude, coordinate.latitude);

        const uppercaseTitle = name ? (
            <Text style={styles.title}>{ name.toUpperCase() }
            </Text>
        ) : false;

        // Buttons
        var swipeoutBtns = [];
        if (phone) {
            swipeoutBtns.push({
                text: 'Call',
                backgroundColor: colors.call,
                onPress: this.linkPhone,
                component: (<SideButton title="Call" iconName="ios-call"/>)
            });
        }
        // map
        swipeoutBtns.push({
            text: 'Direction',
            backgroundColor: colors.map,
            onPress: this.linkDirection,
            component: (<SideButton title="Direction" iconName="ios-navigate"/>)
        });

        return (
            <Swipeout
                ref={(ref) => this.swipeOutRef = ref}
                openRight={this.state.opened}
                right={swipeoutBtns}
                autoClose
                rowID={this.props.id}
                sectionID={this.props.index}
                onOpen={(sectionID, rowID) => {
                  this.setState({
                    sectionID,
                    rowID,
                  })
                }}
                onClose={(sectionID, rowID, direction) => {
                    if (__DEV__) { console.log('===close ' + sectionID + ' ' + rowID + ' ' + direction); }
                    this.setState({ opened: false });
                }}
                scroll={event => console.log('scroll event ' + this.state.rowID) }
            >
                <TouchableOpacity
                    style={styles.listInnerContainer}
                    activeOpacity={0.8}
                    onPress={() => {
                        this.setState({ opened: true });
                        this._onPress();
                    }}
                >
                    <View style={styles.listItemContainer}>
                        { uppercaseTitle }
                        <View style={{ alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                            <View style={{flex:2}}>
                                <Text style={styles.subtitle}>{`${title}`}</Text>
                            </View>
                            <View style={styles.infoContainer}>
                                {this.renderHours}
                                <Text style={[styles.subtitle, {textAlign:'right'}]}>
                                    {'distance: ' + distance.toFixed(2) + ' mi'}</Text>
                                {this.renderRating}
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Swipeout>
        );
    }
};
