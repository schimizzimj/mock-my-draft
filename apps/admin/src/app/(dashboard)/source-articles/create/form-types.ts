import * as yup from 'yup';

export const gradeOptions = [
  'A+',
  'A',
  'A-',
  'B+',
  'B',
  'B-',
  'C+',
  'C',
  'C-',
  'D+',
  'D',
  'D-',
  'F',
];

export interface FormValues {
  sourceId: string;
  title: string;
  url: string;
  publicationDate?: string;
  year: number;
  draftClassGrades: {
    id?: string;
    teamId: string;
    grade: string;
    comments?: string;
    playerGrades?: {
      id?: string;
      playerId: string;
      grade?: string;
      comments?: string;
      draftPickId: string;
    }[];
  }[];
}

const playerGradeSchema = yup.object().shape({
  playerId: yup.string().required('Player ID is required'),
  grade: yup
    .string()
    .transform((value, originalValue) =>
      originalValue.trim() === '' ? undefined : value,
    )
    .oneOf([...gradeOptions, undefined], 'Grade is not valid'),
  comments: yup
    .string()
    .max(5000, 'Comments must be less than 5000 characters'),
  draftPickId: yup.string().required('Draft pick ID is required'),
});

export const formSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .min(5, 'Title is too short'),
  url: yup.string().required('URL is required').url('URL is not valid'),
  year: yup
    .number()
    .required('Year is required')
    .min(1970, 'Year must be greater than 1970')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future')
    .integer('Year must be a whole number'),
  publicationDate: yup
    .string()
    .test(
      'is-date',
      'Publication date is not valid',
      (value?: string) => !value || !isNaN(Date.parse(value)),
    )
    .test(
      'not-future',
      'Publication date cannot be in the future',
      (value?: string) => !value || new Date(value) <= new Date(),
    ),
  sourceId: yup.string().required('Source is required'),
  draftClassGrades: yup
    .array()
    .of(
      yup.object().shape({
        grade: yup
          .string()
          .required('Grade is required')
          .oneOf(gradeOptions, 'Grade is not valid'),
        comments: yup
          .string()
          .max(5000, 'Comments must be less than 5000 characters'),
        teamId: yup.string().required('Team ID is required'),
        playerGrades: yup.array().of(playerGradeSchema),
      }),
    )
    .required('All teams must have a grade'),
});
