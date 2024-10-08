import { useMutation, useQuery } from '@tanstack/react-query';
import { CreateDraftGradeDto, DraftGrade, UpdateDraftGradeDto } from '../types';
import apiClient from './api-client';
import { queryClient } from './react-query';

export const getDraftGrades = async (): Promise<DraftGrade[]> => {
  return await apiClient.get('/draft-class-grades');
};

export const createDraftGrade = async (
  draftGradeData: CreateDraftGradeDto,
): Promise<DraftGrade> => {
  return await apiClient.post('/draft-class-grades', draftGradeData);
};

export const updateDraftGrade = async (
  draftGradeId: string,
  draftGradeData: UpdateDraftGradeDto,
): Promise<DraftGrade> => {
  return await apiClient.put(
    `/draft-class-grades/${draftGradeId}`,
    draftGradeData,
  );
};

export const deleteDraftGrade = async (draftGradeId: string) => {
  return await apiClient.delete(`/draft-class-grades/${draftGradeId}`);
};

export const useDraftGrades = () => {
  const { data, isFetching, isFetched } = useQuery({
    queryKey: ['draft-grades'],
    queryFn: () => getDraftGrades(),
    initialData: [],
  });

  return {
    draftGrades: data,
    isLoading: isFetching && !isFetched,
  };
};

export const useCreateDraftGrade = ({
  onSuccess,
}: {
  onSuccess?: (draftGrade: DraftGrade) => void;
}) => {
  const {
    mutate: submit,
    isPending,
    data,
    mutateAsync: submitAsync,
  } = useMutation({
    mutationFn: createDraftGrade,
    onSuccess: (draftGrade) => {
      queryClient.invalidateQueries({ queryKey: ['draft-grades'] });
      onSuccess?.(draftGrade);
    },
  });

  return { submit, isLoading: isPending, data, submitAsync };
};

export const useUpdateDraftGrade = ({
  onSuccess,
}: {
  onSuccess?: (draftGrade: DraftGrade) => void;
}) => {
  const {
    mutate: submit,
    isPending,
    mutateAsync: submitAsync,
  } = useMutation({
    mutationFn: (draftGradeData: UpdateDraftGradeDto) =>
      updateDraftGrade(draftGradeData.id, draftGradeData),
    onSuccess: (draftGrade) => {
      queryClient.invalidateQueries({ queryKey: ['draft-grades'] });
      onSuccess?.(draftGrade);
    },
  });

  return { submit, isLoading: isPending, submitAsync };
};

export const useDeleteDraftGrade = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const { mutate: submit, isPending } = useMutation({
    mutationFn: deleteDraftGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-grades'] });
      onSuccess?.();
    },
  });

  return { submit, isLoading: isPending };
};
