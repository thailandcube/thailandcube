'use client';

import { EventCodeToFullMap } from '@/app/utils/EnumMapper';
import { NationalRecord } from '@/generated/prisma/client';
import { FileArrowUp, FolderArrowUp, Xmark } from '@gravity-ui/icons';
import {
  Button,
  FieldError,
  Input,
  Label,
  Modal,
  Spinner,
  TextArea,
  TextField,
  toast,
  useOverlayState,
} from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { updateNationalRecord } from '@/app/actions/national-records';
import { useRouter } from 'next/navigation';

export default function EditRecordModal({
  state,
  recordData,
}: {
  state: ReturnType<typeof useOverlayState>;
  recordData: NationalRecord;
}) {
  const [formData, setFormData] = useState({ ...recordData, caption: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({ ...recordData, caption: recordData?.caption ?? '' });
    setSelectedFile(null);
    setFileError(null);
    setErrors({});
  }, [recordData]);

  useEffect(() => {
    if (!selectedFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  if (!recordData) return null;

  const existingImageUrl =
    recordData.mimeType && recordData.imageData
      ? `data:${recordData.mimeType};base64,${recordData.imageData}`
      : null;
  const previewSrc = previewUrl ?? existingImageUrl;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setFileError(null);
    } 
    else if (file) {
      setFileError('Please select a valid image file (JPG or PNG).');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.holder?.trim()) nextErrors.holder = 'Record holder is required.';
    if (!formData.competition?.trim()) nextErrors.competition = 'Competition is required.';
    if (!formData.result?.trim()) nextErrors.result = 'Result is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) 
      return;

    setIsSaving(true);

    try {
      const payload = new FormData();

      payload.append('id', formData.id.toString());
      payload.append('holder', formData.holder);
      payload.append('competition', formData.competition);
      payload.append('result', formData.result);
      payload.append('event', formData.event);
      payload.append('type', formData.type);
      payload.append('caption', formData.caption || '');
      payload.append('file', selectedFile!);

      const result = await updateNationalRecord(recordData.id, payload);

      if (result.success) {
        toast.success('Successfully updated NR data.');

        router.refresh();
      }
      else {
        console.error(result.message);

        toast.danger('An error occured!');
      }

      state.close();
    } 
    finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal state={state}>
      <Modal.Backdrop variant='blur'>
        <Modal.Container size='lg' scroll='inside'>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {EventCodeToFullMap[recordData.event]} ({recordData.type})
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body className='flex flex-col gap-5'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <TextField isRequired isInvalid={Boolean(errors.holder)} className='w-full'>
                  <Label>Record Holder</Label>
                  <Input
                    value={formData.holder ?? ''}
                    onChange={(e) => handleInputChange('holder', e.target.value)}
                    type='text'
                  />
                  {errors.holder && <FieldError>{errors.holder}</FieldError>}
                </TextField>

                <TextField isRequired isInvalid={Boolean(errors.competition)} className='w-full'>
                  <Label>Competition</Label>
                  <Input
                    value={formData.competition ?? ''}
                    onChange={(e) => handleInputChange('competition', e.target.value)}
                    type='text'
                  />
                  {errors.competition && <FieldError>{errors.competition}</FieldError>}
                </TextField>
              </div>

              <TextField isRequired isInvalid={Boolean(errors.result)} className='w-full'>
                <Label>Result</Label>
                <Input
                  placeholder='ผลการแก้โจทย์ที่ได้ เช่น 4.02, 4:22.38, 27/28 48:35'
                  value={formData.result ?? ''}
                  onChange={(e) => handleInputChange('result', e.target.value)}
                  type='text'
                />
                {errors.result && <FieldError>{errors.result}</FieldError>}
              </TextField>

              <div className='flex flex-col gap-2'>
                <Label>NR Image</Label>

                <input
                  type='file'
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept='.jpg,.jpeg,.png'
                  className='hidden'
                />

                {previewSrc ? (
                  <div className='flex flex-col gap-3'>
                    <div className='relative h-48 w-full overflow-hidden rounded-lg border border-default-200 bg-black/5'>
                      <Image
                        src={previewSrc}
                        alt='NR preview'
                        fill
                        unoptimized
                        className='object-contain'
                      />
                    </div>

                    <div className='flex flex-wrap items-center gap-2'>
                      <Button variant='outline' size='sm' onPress={handleUploadClick}>
                        {selectedFile ? 'Choose a different image' : 'Replace image'}
                      </Button>
                      {selectedFile && (
                        <Button variant='ghost' size='sm' onPress={handleRemoveFile}>
                          Discard new image
                        </Button>
                      )}
                    </div>

                    {selectedFile && (
                      <div className='flex items-center justify-between rounded-lg border border-default-200 bg-default-50 p-3'>
                        <div className='flex min-w-0 items-center gap-3'>
                          <FileArrowUp className='h-6 w-6 shrink-0 text-primary' />
                          <div className='flex min-w-0 flex-col'>
                            <span className='truncate text-sm font-medium'>
                              {selectedFile.name}
                            </span>
                            <span className='text-xs text-default-400'>
                              {(selectedFile.size / 1024).toFixed(2)} KB
                            </span>
                          </div>
                        </div>
                        <Button
                          isIconOnly
                          size='sm'
                          variant='danger'
                          aria-label='Remove selected image'
                          onPress={handleRemoveFile}
                        >
                          <Xmark className='h-4 w-4' />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant='outline'
                    className='h-28 w-full border-2 border-dashed'
                    onPress={handleUploadClick}
                  >
                    <span className='flex flex-col items-center gap-2'>
                      <FolderArrowUp className='h-6 w-6' />
                      <span>Click to upload NR image</span>
                    </span>
                  </Button>
                )}

                {fileError && <p className='text-sm text-danger'>{fileError}</p>}
              </div>

              <TextField className='w-full'>
                <Label>Caption</Label>
                <TextArea
                  value={formData.caption ?? ''}
                  onChange={(e) => handleInputChange('caption', e.target.value)}
                  placeholder='ข้อความประกอบ NR'
                />
              </TextField>
            </Modal.Body>

            <Modal.Footer>
              <Button slot='close' variant='tertiary' isDisabled={isSaving}>
                Cancel
              </Button>
              <Button variant='primary' isPending={isSaving} onPress={handleSave}>
                {({ isPending }) => (
                  <>
                    {isPending && <Spinner size='sm' />}
                    <span>{isPending ? 'Saving…' : 'Save changes'}</span>
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}