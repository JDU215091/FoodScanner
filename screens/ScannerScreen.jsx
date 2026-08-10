// import React, { useState, useEffect, useRef } from "react"
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   Animated,
//   Dimensions,
//   StatusBar,
//   Platform,
// } from "react-native"
// import { Camera, CameraType } from "expo-camera"
// import { MaterialIcons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"

// const { width, height } = Dimensions.get("window")
// const scanAreaSize = width * 0.7

// export default function ScannerScreen({ navigation }) {
//   const [hasPermission, setHasPermission] = useState(null)
//   const [scanned, setScanned] = useState(false)

//   // Animation values
//   const fadeAnim = useRef(new Animated.Value(0)).current
//   const pulseAnim = useRef(new Animated.Value(0)).current
//   const scanLineAnim = useRef(new Animated.Value(0)).current

//   useEffect(() => {
//     // Request camera permissions
//     ;(async () => {
//       const { status } = await Camera.requestCameraPermissionsAsync()
//       setHasPermission(status === "granted")
//     })()

//     // Start animations
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 600,
//       useNativeDriver: true,
//     }).start()

//     startPulseAnimation()
//     startScanLineAnimation()
//   }, [])

//   // Pulse animation
//   const startPulseAnimation = () => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 0,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//       ]),
//     ).start()
//   }

//   // Scan line animation
//   const startScanLineAnimation = () => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(scanLineAnim, {
//           toValue: scanAreaSize,
//           duration: 2000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(scanLineAnim, {
//           toValue: 0,
//           duration: 2000,
//           useNativeDriver: true,
//         }),
//       ]),
//     ).start()
//   }

//   // Scan result
//   const handleBarCodeScanned = ({ type, data }) => {
//     setScanned(true)
//     navigation.navigate("Product", { barcode: data })
//   }

//   // Calculate pulse scale
//   const pulseScale = pulseAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [1, 1.05],
//   })

//   const renderContent = () => {
//     if (hasPermission === null) {
//       return (
//         <View style={styles.messageContainer}>
//           <View style={styles.iconContainer}>
//             <MaterialCommunityIcons name="camera" color="#121212" size={40} />
//           </View>
//           <Text style={styles.messageTitle}>Requesting Camera Access</Text>
//           <Text style={styles.messageText}>Please wait while we request permission to use your camera...</Text>
//         </View>
//       )
//     }

//     if (hasPermission === false) {
//       return (
//         <View style={styles.messageContainer}>
//           <View style={styles.iconContainer}>
//             <MaterialIcons name="error-outline" color="#121212" size={40} />
//           </View>
//           <Text style={styles.messageTitle}>Camera Access Denied</Text>
//           <Text style={styles.messageText}>
//             Camera access is required to scan barcodes. Please grant permission in your device settings.
//           </Text>
//           <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
//             <Text style={styles.primaryButtonText}>Return to Home</Text>
//           </TouchableOpacity>
//         </View>
//       )
//     }

//     return (
//       <View style={styles.scannerContainer}>
//         <Camera
//           style={StyleSheet.absoluteFillObject}
//           type={CameraType.back}
//           onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
//           barCodeScannerSettings={{
//             barCodeTypes: ["qr", "ean13", "code128"], // какие именно форматы поддерживать
//           }}
//         />

//         {/* Scanner overlay */}
//         <View style={styles.overlay}>
//           <View style={styles.scanWindow}>
//             {/* Animated scanner frame */}
//             <Animated.View
//               style={[
//                 styles.scannerFrame,
//                 {
//                   transform: [{ scale: pulseScale }],
//                 },
//               ]}
//             />

//             {/* Animated scan line */}
//             <Animated.View
//               style={[
//                 styles.scanLine,
//                 {
//                   transform: [{ translateY: scanLineAnim }],
//                 },
//               ]}
//             />

//             {/* Corner elements */}
//             <View style={[styles.corner, styles.topLeftCorner]} />
//             <View style={[styles.corner, styles.topRightCorner]} />
//             <View style={[styles.corner, styles.bottomLeftCorner]} />
//             <View style={[styles.corner, styles.bottomRightCorner]} />
//           </View>

//           <View style={styles.instructionContainer}>
//             <View style={styles.instructionBox}>
//               <Feather name="maximize" color="#DDC0FF" size={22} />
//               <Text style={styles.instructionText}>Position barcode within the frame</Text>
//             </View>
//           </View>
//         </View>

//         {/* Rescan button */}
//         {scanned && (
//           <View style={styles.rescanButtonContainer}>
//             <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
//               <MaterialIcons name="refresh" size={18} color="#FFFFFF" style={styles.rescanIcon} />
//               <Text style={styles.rescanButtonText}>Scan Again</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     )
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
//           <MaterialIcons name="arrow-back" color="#FFFFFF" size={24} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Product Scanner</Text>
//         <View style={{ width: 44 }} />
//       </View>

//       {/* Main content */}
//       <Animated.View style={[styles.container, { opacity: fadeAnim }]}>{renderContent()}</Animated.View>
//     </SafeAreaView>
//   )
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#000000",
//   },
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingTop: Platform.OS === "ios" ? 10 : 16 + StatusBar.currentHeight,
//     paddingBottom: 16,
//     backgroundColor: "rgba(0, 0, 0, 0.8)",
//     zIndex: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "rgba(255, 255, 255, 0.1)",
//   },
//   backButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "rgba(221, 192, 255, 0.2)",
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "rgba(221, 192, 255, 0.3)",
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#FFFFFF",
//   },
//   scannerContainer: {
//     flex: 1,
//     position: "relative",
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.7)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   scanWindow: {
//     width: scanAreaSize,
//     height: scanAreaSize,
//     justifyContent: "center",
//     alignItems: "center",
//     position: "relative",
//   },
//   scannerFrame: {
//     position: "absolute",
//     width: scanAreaSize,
//     height: scanAreaSize,
//     borderWidth: 2,
//     borderColor: "rgba(221, 192, 255, 0.5)",
//     backgroundColor: "transparent",
//   },
//   scanLine: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 2,
//     backgroundColor: "#DDC0FF",
//     width: scanAreaSize,
//   },
//   corner: {
//     position: "absolute",
//     width: 24,
//     height: 24,
//     borderColor: "#DDC0FF",
//     borderWidth: 3,
//     backgroundColor: "transparent",
//   },
//   topLeftCorner: {
//     top: 0,
//     left: 0,
//     borderBottomWidth: 0,
//     borderRightWidth: 0,
//   },
//   topRightCorner: {
//     top: 0,
//     right: 0,
//     borderBottomWidth: 0,
//     borderLeftWidth: 0,
//   },
//   bottomLeftCorner: {
//     bottom: 0,
//     left: 0,
//     borderTopWidth: 0,
//     borderRightWidth: 0,
//   },
//   bottomRightCorner: {
//     bottom: 0,
//     right: 0,
//     borderTopWidth: 0,
//     borderLeftWidth: 0,
//   },
//   instructionContainer: {
//     position: "absolute",
//     bottom: height * 0.15,
//     left: 20,
//     right: 20,
//     alignItems: "center",
//   },
//   instructionBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.8)",
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "rgba(221, 192, 255, 0.3)",
//     ...Platform.select({
//       ios: {
//         shadowColor: "#000000",
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 4,
//       },
//     }),
//   },
//   instructionText: {
//     fontSize: 16,
//     color: "#FFFFFF",
//     marginLeft: 12,
//     fontWeight: "500",
//   },
//   rescanButtonContainer: {
//     position: "absolute",
//     bottom: 40,
//     left: 0,
//     right: 0,
//     alignItems: "center",
//   },
//   rescanButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#DDC0FF",
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 16,
//     ...Platform.select({
//       ios: {
//         shadowColor: "#000000",
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 4,
//       },
//     }),
//   },
//   rescanIcon: {
//     marginRight: 8,
//   },
//   rescanButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#FFFFFF",
//   },
//   messageContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     padding: 30,
//   },
//   iconContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "#DDC0FF",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   messageTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#121212",
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   messageText: {
//     fontSize: 16,
//     color: "#666666",
//     textAlign: "center",
//     lineHeight: 24,
//     marginBottom: 30,
//   },
//   primaryButton: {
//     backgroundColor: "#DDC0FF",
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 16,
//     alignItems: "center",
//   },
//   primaryButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#FFFFFF",
//   },
// })
