import type { NativeStackScreenProps } from
  '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';

import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
type Props = NativeStackScreenProps<
  RootStackParamList,
  'HandwritingAssessment'
>;

export default function HandwritingAssessmentScreen({
  navigation,
}: Props) {
      const [spiralImage, setSpiralImage] =
        useState<ImagePicker.ImagePickerAsset | null>(null);
    
      const [meanderImage, setMeanderImage] =
        useState<ImagePicker.ImagePickerAsset | null>(null);
  const pickImage = async (
    type: 'spiral' | 'meander'
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) return;

    const image = result.assets[0];

    if (type === 'spiral') {
      setSpiralImage(image);
    } else {
      setMeanderImage(image);
    }
  };
  // මෙතැන ඔයාගේ දැනට තිබෙන image picker
  // states සහ UI code එක තියාගන්න.

  const handleAssess = () => {
    if (!spiralImage || !meanderImage) {
      Alert.alert(
        'Images required',
        'Please select both Spiral and Meander images.'
      );
      return;
    }

    navigation.navigate('AssessmentResult', {
      spiralUri: spiralImage.uri,
      meanderUri: meanderImage.uri,
    });
  };

  return (
     <SafeAreaView style={styles.container}>
       <StatusBar style="dark" />
 
       <ScrollView contentContainerStyle={styles.content}>
         <Text style={styles.brand}>NeuroSense</Text>
 
         <Text style={styles.title}>Handwriting Assessment</Text>
 
         <Text style={styles.subtitle}>
           Upload both handwriting samples for assessment.
         </Text>
 
         <ImageCard
           title="Spiral Drawing"
           description="Select the spiral drawing image."
           image={spiralImage}
           onPress={() => pickImage('spiral')}
         />
 
         <ImageCard
           title="Meander Drawing"
           description="Select the meander drawing image."
           image={meanderImage}
           onPress={() => pickImage('meander')}
         />
 
         <TouchableOpacity
           style={styles.assessButton}
           onPress={handleAssess}
         >
           <Text style={styles.assessButtonText}>
             Assess Handwriting
           </Text>
         </TouchableOpacity>
 
         <Text style={styles.disclaimer}>
           Research support tool only. Not a medical diagnosis.
         </Text>
       </ScrollView>
     </SafeAreaView>
   );
 }
 


type ImageCardProps = {
  title: string;
  description: string;
  image: ImagePicker.ImagePickerAsset | null;
  onPress: () => void;
};

function ImageCard({
  title,
  description,
  image,
  onPress,
}: ImageCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {image ? (
        <Image source={{ uri: image.uri }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            No image selected
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.uploadButton} onPress={onPress}>
        <Text style={styles.uploadButtonText}>
          {image ? 'Change Image' : 'Select Image'}
        </Text>
      </TouchableOpacity>

      {image && (
        <Text style={styles.fileName}>
          {image.fileName || 'Selected image'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    padding: 22,
    paddingTop: 30,
  },
  brand: {
    color: '#3974D8',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 18,
  },
  title: {
    color: '#17243B',
    fontSize: 27,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    color: '#65738A',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E5EAF2',
  },
  cardTitle: {
    color: '#17243B',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    color: '#65738A',
    fontSize: 14,
    marginBottom: 15,
  },
  placeholder: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE3EF',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#8A96A8',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F8FAFD',
    resizeMode: 'contain',
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#3974D8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  uploadButtonText: {
    color: '#3974D8',
    fontSize: 15,
    fontWeight: '600',
  },
  fileName: {
    color: '#65738A',
    fontSize: 12,
    marginTop: 8,
  },
  assessButton: {
    backgroundColor: '#3974D8',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  assessButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimer: {
    color: '#8792A3',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 20,
  },
});
