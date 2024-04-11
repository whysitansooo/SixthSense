import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal,
  Image,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import axios from "axios";

export default function App() {
  const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API;
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(CameraType.back);
  const [photoDetails, setPhotoDetails] = useState(null);
  const [apiResults, setApiResults] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: true,
        });
        setPhotoDetails(photo);
        await sendPhotoToGemini(photo.base64);
      } catch (error) {
        console.error("Error capturing photo:", error);
      }
    }
  };

  const sendPhotoToGemini = async (base64Photo) => {
    console.log(GOOGLE_API_KEY);
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GOOGLE_API_KEY}`,
        {
          contents: [
            {
              parts: [
                { text: "What is this picture?" },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Photo,
                  },
                },
              ],
            },
          ],
        }
      );
      setApiResults(response.data.candidates[0].content.parts[0].text);
      console.log(
        "Gemini API Results:",
        response.data.candidates[0].content.parts[0].text
      );
    } catch (error) {
      console.error("Error sending photo to Gemini:", error);
    }
  };

  const closeModal = () => {
    setPhotoDetails(null);
    setApiResults(null);
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera ref={cameraRef} style={styles.camera} type={type}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Capture Photo</Text>
          </TouchableOpacity>
        </View>
      </Camera>

      {(photoDetails || apiResults) && (
        <Modal visible={true} transparent={true}>
          <View style={styles.modalContainer}>
            {photoDetails && (
              <Image
                source={{ uri: photoDetails.uri }}
                style={styles.modalImage}
              />
            )}
            {apiResults && (
              <View>
                <Text style={styles.modalText}>Gemini API Results:</Text>
                <Text style={styles.modalText}>
                  {JSON.stringify(apiResults)}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalImage: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    color: "white",
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});
