import React, { useCallback, useContext, useState, useMemo, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    ViewStyle,
    TouchableOpacity,
    Text,
    Platform,
} from 'react-native';

import { INotificationContext, INotification, INotiticationProps } from './types';

const NotificationContext = React.createContext<INotificationContext>({
    showNotification: () => {},
    isNotificationShown: false,
    notiObjectId: '',
    notiCate: 0,
});

export function useNotification() {
    return useContext(NotificationContext);
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 0,
        zIndex: 1000,
        elevation: 1,
    },
    containerShown: {
        height: 80,
    },
    content: {
        flex: 1,
        backgroundColor: '#181918BF',
        marginHorizontal: 16,
        paddingHorizontal: 15,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
        flexDirection: 'row',
    },
    contentIcon: {
        width: 24,
        height: 24,
        margin: 10,
        marginRight: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentTextWrapper: {
        display: 'flex',
        justifyContent: 'center',
        flex: 1,
    },
    contentTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
    },
    contentMessage: {
        fontSize: 14,
        lineHeight: 20,
        color: '#ffffff',
    },
});

function Notification({ children }: INotiticationProps) {
    const [notification, setNotification] = useState<INotification | undefined>();
    const [animatedValue] = useState(new Animated.Value(0));
    const hideTimer = useRef<number | undefined>();

    const handleHideNotification = useCallback(() => {
        Animated.timing(animatedValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            // Finished
            setNotification(undefined);
        });
    }, [animatedValue]);

    const handleShowNotification = useCallback(
        ({ title, showingTime = 2000, onPress, message, icon, color = '#181918BF', notiObjectId = '', notiCate }: INotification) => {
            if (!notification) {
                setNotification({
                    title,
                    onPress,
                    showingTime,
                    message,
                    icon,
                    color,
                    notiObjectId,
                    notiCate,
                });

                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: false,
                }).start(() => {
                    // Finished
                    hideTimer.current = window.setTimeout(() => {
                        handleHideNotification();
                    }, showingTime);
                });
            }
        },
        [animatedValue, notification, handleHideNotification]
    );

    const handlePressNotification = useCallback(() => {
        if (notification && notification.onPress) {
            notification.onPress();
            setNotification(undefined);
            clearTimeout(hideTimer.current);
        }
    }, [notification]);

    useEffect(() => {
        return () => {
            clearTimeout(hideTimer.current);
        };
    }, [notification]);

    const content = useMemo(() => {
        if (notification) {
            return (
                <Animated.View
                    style={{
                        ...{
                            transform: [
                                {
                                    translateY: animatedValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 50],
                                    }),
                                },
                            ],
                            opacity:
                                Platform.OS !== 'android'
                                    ? animatedValue.interpolate({
                                          inputRange: [0, 1],
                                          outputRange: [0, 1],
                                      })
                                    : 1,
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0,
                        },
                    }}
                >
                    <TouchableOpacity
                        onPress={handlePressNotification}
                        style={[styles.content, { backgroundColor: notification.color }]}
                    >
                        {notification.icon ? (
                            <View style={styles.contentIcon}>{notification.icon}</View>
                        ) : null}
                        <View style={styles.contentTextWrapper}>
                            <Text numberOfLines={1} style={styles.contentTitle}>
                                {notification.title}
                            </Text>
                            {notification.message ? (
                                <Text numberOfLines={2} style={styles.contentMessage}>
                                    {notification.message}
                                </Text>
                            ) : null}
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            );
        }
    }, [notification, animatedValue]);

    const style: ViewStyle[] = [styles.container];

    if (notification) {
        style.push(styles.containerShown);
    }

    return (
        <NotificationContext.Provider
            value={{
                showNotification: handleShowNotification,
                isNotificationShown: Boolean(notification),
                notiObjectId: notification ? notification.notiObjectId : '',
                notiCate: notification ? notification.notiCate : 0,
            }}
        >
            <View style={style}>{content}</View>
            {children}
        </NotificationContext.Provider>
    );
}

export default Notification;
