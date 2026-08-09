import { getAccessToken } from './firebase';

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode?: string;
  courseState: string;
  alternateLink: string;
  teacherGroupEmail: string;
  courseGroupEmail: string;
  guardiansEnabled: boolean;
  calendarId: string;
}

export interface ListCoursesResponse {
  courses: ClassroomCourse[];
  nextPageToken?: string;
}

/**
 * Fetches the list of courses the user is enrolled in or teaching.
 */
export const listCourses = async (pageToken?: string): Promise<ListCoursesResponse> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('User must be signed in to access Google Classroom');
  }

  const url = new URL('https://classroom.googleapis.com/v1/courses');
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
    console.error('Google Classroom API Error:', errorData);
    throw new Error(errorData.error?.message || 'Failed to fetch Classroom courses');
  }

  return await response.json();
};
