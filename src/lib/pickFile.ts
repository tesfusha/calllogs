import { Platform } from 'react-native';

export type PickedFile = {
  name: string;
  text: string;
};

const ACCEPT = '.csv,.json,text/csv,application/json,text/plain';

/**
 * Ask for a CSV/JSON file and return its text.
 *
 * Web uses a plain `<input type="file">` — no dependency, and it works in the
 * static export where native pickers do not exist. Native goes through
 * `expo-document-picker` (Expo Go compatible) so importing works on a phone
 * the same way it does in the browser.
 */
export function pickTextFile(): Promise<PickedFile | null> {
  return Platform.OS === 'web' ? pickOnWeb() : pickOnNative();
}

function pickOnWeb(): Promise<PickedFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ACCEPT;
    input.style.display = 'none';

    let settled = false;
    const finish = (result: PickedFile | null) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(result);
    };

    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return finish(null);
      try {
        finish({ name: file.name, text: await file.text() });
      } catch {
        finish(null);
      }
    });

    // Chromium/Firefox/Safari emit `cancel` when the dialog is dismissed.
    input.addEventListener('cancel', () => finish(null));

    document.body.appendChild(input);
    input.click();
  });
}

async function pickOnNative(): Promise<PickedFile | null> {
  const { getDocumentAsync } = await import('expo-document-picker');
  const result = await getDocumentAsync({
    type: ['text/csv', 'application/json', 'text/plain'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];
  const response = await fetch(asset.uri);
  return { name: asset.name ?? 'calls.csv', text: await response.text() };
}
