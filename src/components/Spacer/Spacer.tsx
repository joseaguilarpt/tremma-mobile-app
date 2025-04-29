import React from "react";
import { View } from "react-native";

const Spacer = ({ size = 8, horizontal = false }) => (
  <View style={{ [horizontal ? "width" : "height"]: size }} />
);

export default Spacer;
