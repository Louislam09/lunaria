import "../global.css";
import { Slot } from "expo-router";

import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Image, Link } from "@/tw";

export default function Layout() {
  return (
    <View className="flex flex-1 bg-white">
      <Header />
      <Slot />
      <Footer />
    </View>
  );
}

function Header() {
  const { top } = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: top }}>
      <View className="px-4 lg:px-6 h-14 flex items-center flex-row">
        <Image
          source="https://simpleicons.org/icons/expo.svg"
          className="w-6 h-6 object-contain mr-2"
        />
        <Link className="font-bold flex-1 items-center justify-center" href="/">
          ACME
        </Link>
        <View className="flex flex-row gap-4 sm:gap-6">
          <Link
            className="text-md font-medium hover:underline web:underline-offset-4"
            href="/"
          >
            About
          </Link>
          <Link
            className="text-md font-medium hover:underline web:underline-offset-4"
            href="/"
          >
            Product
          </Link>
          <Link
            className="text-md font-medium hover:underline web:underline-offset-4"
            href="/"
          >
            Pricing
          </Link>
        </View>
      </View>
    </View>
  );
}

function Footer() {
  const { bottom } = useSafeAreaInsets();
  return (
    <View
      className="w-full flex-1 border border-red-400 h-1 bg-red-400"
      style={{ paddingBottom: bottom }}
    >
      <Text className={"text-center text-gray-700"}>
        © {new Date().getFullYear()}
      </Text>
      <View className="flex-row justify-center items-center gap-2">

        <Text className={"text-center text-gray-700"}>
          All rights reserved
        </Text>
      </View>
    </View>
  );
}
