import React, { createContext, useContext } from 'react';
import { StyleSheet } from 'react-native';

// Same pairing as nyumbasync.co.ke: Geist for everything, Instrument Serif
// (italic, green) for accent phrases.
export const FONT_ASSETS = {
  Geist_300Light: require('@expo-google-fonts/geist/300Light/Geist_300Light.ttf'),
  Geist_400Regular: require('@expo-google-fonts/geist/400Regular/Geist_400Regular.ttf'),
  Geist_500Medium: require('@expo-google-fonts/geist/500Medium/Geist_500Medium.ttf'),
  Geist_600SemiBold: require('@expo-google-fonts/geist/600SemiBold/Geist_600SemiBold.ttf'),
  Geist_700Bold: require('@expo-google-fonts/geist/700Bold/Geist_700Bold.ttf'),
  InstrumentSerif_400Regular: require('@expo-google-fonts/instrument-serif/400Regular/InstrumentSerif_400Regular.ttf'),
  InstrumentSerif_400Regular_Italic: require('@expo-google-fonts/instrument-serif/400Regular_Italic/InstrumentSerif_400Regular_Italic.ttf'),
};

export const fonts = {
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
};

const FAMILY_BY_WEIGHT = {
  100: 'Geist_300Light', 200: 'Geist_300Light', 300: 'Geist_300Light',
  400: 'Geist_400Regular', normal: 'Geist_400Regular',
  500: 'Geist_500Medium',
  600: 'Geist_600SemiBold',
  700: 'Geist_700Bold', bold: 'Geist_700Bold', 800: 'Geist_700Bold', 900: 'Geist_700Bold',
};

// Android picks a font file per family name, so fontWeight alone cannot select
// Geist's weights. Every Text/TextInput gets the family that matches its weight.
const InsideText = createContext(false);

const wrap = (Base, isText) => {
  const Wrapped = React.forwardRef((props, ref) => {
    const nested = useContext(InsideText);
    const flat = StyleSheet.flatten(props.style) || {};
    let style = props.style;
    if (!flat.fontFamily && !(nested && flat.fontWeight === undefined)) {
      style = [props.style, { fontFamily: FAMILY_BY_WEIGHT[String(flat.fontWeight || 'normal')] || 'Geist_400Regular', fontWeight: 'normal' }];
    }
    const el = <Base {...props} style={style} ref={ref} />;
    return isText ? <InsideText.Provider value>{el}</InsideText.Provider> : el;
  });
  Wrapped.displayName = Base.displayName || (isText ? 'Text' : 'TextInput');
  return Wrapped;
};

let installed = false;
export const installFonts = () => {
  if (installed) return;
  installed = true;
  const RN = require('react-native');
  const BaseText = RN.Text;
  const BaseInput = RN.TextInput;
  const PText = wrap(BaseText, true);
  const PInput = wrap(BaseInput, false);
  Object.defineProperty(RN, 'Text', { configurable: true, enumerable: true, get: () => PText });
  Object.defineProperty(RN, 'TextInput', { configurable: true, enumerable: true, get: () => PInput });
};
