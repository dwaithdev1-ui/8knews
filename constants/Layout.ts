import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

/**
 * 📏 APP LAYOUT CONSTANTS
 * These ensure the "Inshorts" look remains consistent on all screen sizes.
 */
export const LAYOUT = {
    // Mobile-first constraints
    MAX_WIDTH: 420,
    MAX_HEIGHT: 820,

    // Dynamic height and width
    get windowHeight() {
        return Math.round(Dimensions.get('window').height);
    },

    get windowWidth() {
        return Math.round(Dimensions.get('window').width);
    }
};

