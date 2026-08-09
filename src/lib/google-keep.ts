import { getAccessToken } from './firebase';

export interface KeepNoteRequest {
  title: string;
  text: string;
}

/**
 * Fetches the list of notes from Google Keep.
 * Note: Listing notes may only return notes created by this app depending on permissions.
 */
export const listNotes = async (pageToken?: string) => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('User must be signed in to access Google Keep');
  }

  const url = new URL('https://keep.googleapis.com/v1/notes');
  if (pageToken) {
    url.searchParams.append('pageToken', pageToken);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Google Keep API Error:', errorData);
    throw new Error(errorData.error?.message || 'Failed to fetch notes from Google Keep');
  }

  return await response.json();
};

/**
 * Creates a new note in Google Keep.
 * @param note The note content (title and text).
 * @returns The created note object.
 */
export const createKeepNote = async (note: KeepNoteRequest) => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('User must be signed in to save to Google Keep');
  }

  const response = await fetch('https://keep.googleapis.com/v1/notes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: note.title,
      body: {
        text: {
          text: note.text
        }
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Google Keep API Error:', errorData);
    throw new Error(errorData.error?.message || 'Failed to create note in Google Keep');
  }

  return await response.json();
};
