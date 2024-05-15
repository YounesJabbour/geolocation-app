import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  Button,
  StyleSheet,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { CameraType } from "expo-camera/build/legacy/Camera.types";

const CameraComponent: React.FC = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [type, setType] = useState(CameraType.back);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true); // New state variable
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === "granted");
    })();

    // Clean up camera resources when component is unmounted
    return () => {
      setIsCameraEnabled(false); // Disable camera
    };
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && isCameraEnabled) {
      // Check if camera is enabled
      let photo = await cameraRef.current.takePictureAsync();
      setCapturedPhoto(photo.uri);
      savePhoto(photo.uri);

      // Get location
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("status", status);
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }
  };

  const savePhoto = async (uri: string) => {
    const res = await MediaLibrary.requestPermissionsAsync();
    if (res.granted) {
      await MediaLibrary.saveToLibraryAsync(uri);
    } else {
      console.log("Permission denied to save photo to device");
    }
  };

  const openLocationInMaps = (latitude: any, longitude: any) => {
    if (!latitude || !longitude) return console.log("No location data");

    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  if (hasCameraPermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      {isCameraEnabled && (
        <CameraView style={{ flex: 1 }} ref={cameraRef}>
          <View
            style={{
              flex: 1,
              backgroundColor: "transparent",
              flexDirection: "row",
              justifyContent: "space-between",
              margin: 20,
            }}
          >
            <TouchableOpacity
              style={styles.FlipCameraButton}
              onPress={() => {
                setType(
                  type === CameraType.back ? CameraType.front : CameraType.back
                );
              }}
            >
              <Text style={{ fontSize: 18, marginBottom: 10, color: "white" }}>
                Flip
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.TakePhotoButton}
              onPress={takePicture}
            >
              <Text style={{ fontSize: 18, marginBottom: 10, color: "white" }}>
                Capture
              </Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
      {capturedPhoto && (
        <>
          <Image source={{ uri: capturedPhoto }} style={{ flex: 1 }} />
          <Button
            title="Open Maps"
            onPress={() =>
              openLocationInMaps(
                location.coords.latitude,
                location.coords.longitude
              )
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  TakePhotoButton: {
    marginTop: 60,
  },
  FlipCameraButton: {
    marginTop: 60,
  },
});

export default CameraComponent;
