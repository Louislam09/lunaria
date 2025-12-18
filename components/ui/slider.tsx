import React, { useRef, useEffect, useState } from 'react';
import { View, ViewProps, Pressable, PressableProps, PanResponder, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SliderContextValue {
  value: Animated.Value;
  minValue: number;
  maxValue: number;
  step: number;
  trackWidth: number;
  onValueChange?: (value: number) => void;
  isDisabled: boolean;
  sliderTrackHeight: number;
  getValue: (position: number) => number;
  getPosition: (val: number) => number;
}

const SliderContext = React.createContext<SliderContextValue | null>(null);

interface SliderProps extends ViewProps {
  defaultValue?: number;
  value?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  onChange?: (value: number) => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  sliderTrackHeight?: number;
  children: React.ReactNode;
}

export function Slider({
  defaultValue = 0,
  value: controlledValue,
  minValue = 0,
  maxValue = 100,
  step = 1,
  onChange,
  isDisabled = false,
  isReadOnly = false,
  sliderTrackHeight = 8,
  children,
  style,
  ...props
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const trackWidth = SCREEN_WIDTH - 48 - 40; // Screen width - padding - container padding

  const getPosition = (val: number) => {
    const percentage = (val - minValue) / (maxValue - minValue);
    return percentage * trackWidth;
  };

  const getValue = (position: number) => {
    const percentage = Math.max(0, Math.min(1, position / trackWidth));
    const rawValue = minValue + percentage * (maxValue - minValue);
    return Math.round(rawValue / step) * step;
  };

  const animatedValue = useRef(new Animated.Value(getPosition(value))).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: getPosition(value),
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [value, minValue, maxValue, trackWidth]);

  const handleValueChange = (newValue: number) => {
    if (!isDisabled && !isReadOnly) {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }
  };

  const getValueFromPosition = (position: number) => {
    const percentage = Math.max(0, Math.min(1, position / trackWidth));
    const rawValue = minValue + percentage * (maxValue - minValue);
    return Math.round(rawValue / step) * step;
  };

  const getPositionFromValue = (val: number) => {
    const percentage = (val - minValue) / (maxValue - minValue);
    return percentage * trackWidth;
  };

  const contextValue: SliderContextValue = {
    value: animatedValue,
    minValue,
    maxValue,
    step,
    trackWidth,
    onValueChange: handleValueChange,
    isDisabled: isDisabled || isReadOnly,
    sliderTrackHeight,
    getValue: getValueFromPosition,
    getPosition: getPositionFromValue,
  };

  return (
    <SliderContext.Provider value={contextValue}>
      <View style={[{ width: '100%' }, style]} {...props}>
        {children}
      </View>
    </SliderContext.Provider>
  );
}

interface SliderTrackProps extends PressableProps {
  children: React.ReactNode;
}

export function SliderTrack({ children, style, onPress, ...props }: SliderTrackProps) {
  const context = React.useContext(SliderContext);
  if (!context) throw new Error('SliderTrack must be used within Slider');

  const handlePress = (event: any) => {
    if (context.isDisabled) return;
    const { locationX } = event.nativeEvent;
    const newPosition = Math.max(0, Math.min(context.trackWidth, locationX));
    const newValue = context.getValue(newPosition);
    const clampedValue = Math.max(context.minValue, Math.min(context.maxValue, newValue));
    
    Animated.spring(context.value, {
      toValue: context.getPosition(clampedValue),
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
    
    context.onValueChange?.(clampedValue);
    onPress?.(event);
  };

  return (
    <Pressable
      style={[
        {
          height: context.sliderTrackHeight,
          width: context.trackWidth,
          backgroundColor: '#e2e8f0',
          borderRadius: context.sliderTrackHeight / 2,
          position: 'relative',
          overflow: 'visible',
        },
        style,
      ]}
      disabled={context.isDisabled}
      onPress={handlePress}
      {...props}
    >
      {children}
    </Pressable>
  );
}

interface SliderFilledTrackProps extends ViewProps {}

export function SliderFilledTrack({ style, ...props }: SliderFilledTrackProps) {
  const context = React.useContext(SliderContext);
  if (!context) throw new Error('SliderFilledTrack must be used within Slider');

  return (
    <Animated.View
      style={[
        {
          height: context.sliderTrackHeight,
          backgroundColor: '#256af4',
          borderRadius: context.sliderTrackHeight / 2,
          width: context.value,
        },
        style,
      ]}
      {...props}
    />
  );
}

interface SliderThumbProps extends ViewProps {}

export function SliderThumb({ style, ...props }: SliderThumbProps) {
  const context = React.useContext(SliderContext);
  if (!context) throw new Error('SliderThumb must be used within Slider');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !context.isDisabled,
      onMoveShouldSetPanResponder: () => !context.isDisabled,
      onPanResponderGrant: (evt) => {
        if (context.isDisabled) return;
        const touchX = evt.nativeEvent.locationX;
        const newPosition = Math.max(0, Math.min(context.trackWidth, touchX));
        context.value.setValue(newPosition);
        const newValue = context.getValue(newPosition);
        const clampedValue = Math.max(context.minValue, Math.min(context.maxValue, newValue));
        context.onValueChange?.(clampedValue);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (context.isDisabled) return;
        const currentPos = (context.value as any)._value + gestureState.dx;
        const newPosition = Math.max(0, Math.min(context.trackWidth, currentPos));
        context.value.setValue(newPosition);
        const newValue = context.getValue(newPosition);
        const clampedValue = Math.max(context.minValue, Math.min(context.maxValue, newValue));
        context.onValueChange?.(clampedValue);
      },
      onPanResponderRelease: () => {
        if (context.isDisabled) return;
        const currentPos = (context.value as any)._value;
        const newValue = context.getValue(currentPos);
        const clampedValue = Math.max(context.minValue, Math.min(context.maxValue, newValue));
        Animated.spring(context.value, {
          toValue: context.getPosition(clampedValue),
          useNativeDriver: false,
          tension: 50,
          friction: 7,
        }).start();
        context.onValueChange?.(clampedValue);
      },
    })
  ).current;


  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        {
          position: 'absolute',
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#256af4',
          transform: [{ translateX: Animated.subtract(context.value, 10) }],
          top: -8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        },
        style,
      ]}
      {...props}
    />
  );
}

