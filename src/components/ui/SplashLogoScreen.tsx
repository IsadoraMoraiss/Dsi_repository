import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Size } from '../../constants/Tokens';

type SplashLogoScreenProps = {
  logoSource: number;
};

export default function SplashLogoScreen({ logoSource }: SplashLogoScreenProps) {
  return (
    <View style={styles.container}>
      <Image source={logoSource} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: Size.logoMd,
    height: Size.logoMd,
  },
});
