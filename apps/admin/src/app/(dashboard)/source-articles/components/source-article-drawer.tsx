import { FormEvent, useEffect, useState } from 'react';
import {
  useCreateSourceArticle,
  useUpdateSourceArticle,
} from '@/lib/sources-articles';
import { CreateSourceArticleDto, Source, SourceArticle } from '@/types';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Input,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useSources } from '@/lib/sources';
import { boxShadow } from '@/utils/style-utils';

interface SourceArticleFormProps {
  sourceArticle: Partial<CreateSourceArticleDto>;
  onChange: (sourceArticle: Partial<CreateSourceArticleDto>) => void;
  sources: Source[];
}

function SourceArticleForm({
  sourceArticle,
  onChange,
  sources,
}: SourceArticleFormProps) {
  return (
    <Box as="form">
      <VStack spacing={4} mb={8}>
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input
            value={sourceArticle.title}
            onChange={(e) =>
              onChange({ ...sourceArticle, title: e.target.value })
            }
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>URL</FormLabel>
          <Input
            value={sourceArticle.url}
            onChange={(e) =>
              onChange({ ...sourceArticle, url: e.target.value })
            }
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Year</FormLabel>
          <Input
            type="number"
            min={1900}
            max={new Date().getFullYear()}
            value={sourceArticle.year}
            onChange={(e) =>
              onChange({ ...sourceArticle, year: parseInt(e.target.value) })
            }
          />
        </FormControl>
        <FormControl>
          <FormLabel>Publication date</FormLabel>
          <Input
            type="date"
            value={
              sourceArticle.publicationDate
                ? new Date(sourceArticle.publicationDate)
                    .toISOString()
                    .split('T')[0]
                : ''
            }
            onChange={(e) =>
              onChange({
                ...sourceArticle,
                publicationDate: e.target.value,
              })
            }
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Source</FormLabel>
          <Input
            as="select"
            value={sourceArticle.sourceId ? sourceArticle.sourceId : ''}
            onChange={(e) =>
              onChange({
                ...sourceArticle,
                sourceId: e.target.value,
              })
            }
          >
            <option value="">Select a source</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </Input>
        </FormControl>
      </VStack>
    </Box>
  );
}

interface SourceArticleDrawerProps {
  sourceArticle: Partial<CreateSourceArticleDto>;
  onChange: (sourceArticle: Partial<CreateSourceArticleDto>) => void;
  isOpen: boolean;
  onClose: () => void;
  toggleBtnRef: React.MutableRefObject<null>;
  selectedSourceArticleId?: string;
}

function SourceArticleDrawer({
  sourceArticle,
  onChange,
  isOpen,
  onClose,
  toggleBtnRef,
  selectedSourceArticleId,
}: SourceArticleDrawerProps) {
  const createSourceArticle = useCreateSourceArticle({ onSuccess: onClose });
  const updateSourceArticle = useUpdateSourceArticle({ onSuccess: onClose });
  const { sources } = useSources();
  const [isValid, setIsValid] = useState(false);
  const toast = useToast();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    try {
      if (selectedSourceArticleId) {
        updateSourceArticle.submit(sourceArticle as SourceArticle);
        toast({
          title: 'Source article updated',
          description: 'The source article has been updated successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        createSourceArticle.submit(sourceArticle as CreateSourceArticleDto);
        toast({
          title: 'Source article created',
          description: 'The source article has been created successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'We encountered an error',
        description: 'Couldn’t save the source article. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    setIsValid(
      !!sourceArticle.title &&
        !!sourceArticle.url &&
        !!sourceArticle.sourceId &&
        !!sourceArticle.year,
    );
  }, [sourceArticle]);

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        finalFocusRef={toggleBtnRef}
        placement="right"
      >
        <DrawerOverlay />
        <DrawerContent
          bg="elevations.light.dp12"
          _dark={{ bg: 'elevations.dark.dp12' }}
          boxShadow={boxShadow(12)}
        >
          <DrawerCloseButton />

          <DrawerHeader>
            {selectedSourceArticleId
              ? 'Edit source article'
              : 'Add source article'}
          </DrawerHeader>

          <DrawerBody>
            <SourceArticleForm
              sourceArticle={sourceArticle}
              onChange={onChange}
              sources={sources}
            />
          </DrawerBody>

          <DrawerFooter>
            <Box display="flex" justifyContent="space-between" w="full">
              <Button variant="outline" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                isDisabled={!isValid}
              >
                Save
              </Button>
            </Box>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SourceArticleDrawer;
