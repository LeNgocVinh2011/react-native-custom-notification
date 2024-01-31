import { ReactElement } from 'react';
export interface INotiticationProps {
    children: ReactElement;
}
export interface INotificationContext {
    showNotification: (notification: INotification) => void;
    isNotificationShown: boolean;
    notiObjectId?: string;
}
export interface INotification {
    title: string;
    message?: string;
    showingTime?: number;
    onPress?: () => void;
    icon?: ReactElement;
    color?: string;
    notiObjectId?: string;
}
