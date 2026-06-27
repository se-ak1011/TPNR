import * as ImagePicker from 'expo-image-picker';
import { DocumentChecklist } from '@/types';
import { supabase } from '@/lib/supabase';

function getFileExtension(uri: string) {
  const lastDot = uri.lastIndexOf('.');
  if (lastDot === -1) {
    return 'bin';
  }

  return uri.slice(lastDot + 1).toLowerCase();
}

export async function uploadPassportDocument(documentType: keyof DocumentChecklist) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error('Media library permission is required to upload documents.');
  }

  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.9,
  });

  if (picked.canceled || picked.assets.length === 0) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Please log in before uploading documents.');
  }

  const asset = picked.assets[0];
  const extension = getFileExtension(asset.uri);
  const path = `${user.id}/${documentType}-${Date.now()}.${extension}`;

  const fileResponse = await fetch(asset.uri);
  const body = await fileResponse.arrayBuffer();

  const { error } = await supabase.storage.from('documents').upload(path, body, {
    upsert: true,
    contentType: asset.mimeType ?? 'image/jpeg',
  });

  if (error) {
    throw new Error(error.message);
  }

  return { path };
}
