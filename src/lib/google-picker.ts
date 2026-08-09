import firebaseConfig from '../../firebase-applet-config.json';
import { getAccessToken } from './firebase';

// Types for Google Picker
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export interface PickerResult {
  action: string;
  docs?: Array<{
    id: string;
    name: string;
    mimeType: string;
    url: string;
    lastEditedUtc: number;
    iconUrl: string;
    thumbnails?: Array<{
      url: string;
      width: number;
      height: number;
    }>;
  }>;
}

export const loadPicker = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      window.gapi.load('picker', {
        callback: () => resolve(),
        onerror: () => reject(new Error('Failed to load Google Picker')),
        timeout: 5000,
        ontimeout: () => reject(new Error('Picker load timeout'))
      });
    } else {
      reject(new Error('GAPI not found. Make sure index.html includes the gapi script.'));
    }
  });
};

export const createPicker = async (
  onSelect: (docs: PickerResult['docs']) => void,
  onCancel?: () => void
) => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Access token required for Google Picker');
  }

  try {
    await loadPicker();
    
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .setAppId(firebaseConfig.projectId)
      .setOAuthToken(token)
      .setDeveloperKey(firebaseConfig.apiKey)
      .addView(view)
      .setCallback((data: PickerResult) => {
        if (data.action === window.google.picker.Action.PICKED) {
          onSelect(data.docs);
        } else if (data.action === window.google.picker.Action.CANCEL) {
          if (onCancel) onCancel();
        }
      })
      .build();

    picker.setVisible(true);
  } catch (error) {
    console.error('Error creating Picker:', error);
    throw error;
  }
};
