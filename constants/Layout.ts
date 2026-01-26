import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * 📏 APP LAYOUT CONSTANTS
 * These ensure the "Inshorts" look remains consistent on all screen sizes.
 */
export const LAYOUT = {
    // Mobile-first constraints
    MAX_WIDTH: 420,
    MAX_HEIGHT: 820,

    // Dynamic height that respects the max-height constraint
    get windowHeight() {
        return Math.min(SCREEN_HEIGHT, 820);
    },

    get windowWidth() {
        return Math.min(SCREEN_WIDTH, 420);
    }
};

