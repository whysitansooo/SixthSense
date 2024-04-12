import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CaptureInfo from "./screens/CaptureInfo";
import Chatbot from "./screens/Chatbot";

export default function App() {
  return <Chatbot />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
