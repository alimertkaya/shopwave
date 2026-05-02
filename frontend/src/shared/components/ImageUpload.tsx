import { useCallback, useRef, useState } from 'react';
import { ImageOff, Upload, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface Props {
  value?: string;
  onChange: (base64: string | undefined) => void;
  className?: string;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_MB = 2;

export const ImageUpload = ({ value, onChange, className }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string>();

  const processFile = useCallback(
    (file: File) => {
      setError(undefined);
      if (!ACCEPTED.includes(file.type)) {
        setError('Only JPG, PNG, WebP or GIF files are allowed.');
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`File size must not exceed ${MAX_MB} MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => onChange(e.target?.result as string);
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {value ? (
        <div className="relative h-48 w-full rounded-lg border overflow-hidden group">
          <img src={value} alt="Product image" className="h-full w-full object-contain bg-muted" />
          <button
            type="button"
            onClick={() => { onChange(undefined); setError(undefined); }}
            className="absolute top-2 right-2 rounded-full bg-background/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity border hover:bg-destructive hover:text-white hover:border-destructive"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-1 text-xs border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex h-48 w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors',
            dragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-muted/50',
          )}
        >
          {dragging ? (
            <Upload className="h-8 w-8 text-primary animate-bounce" />
          ) : (
            <ImageOff className="h-8 w-8 text-muted-foreground/50" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium">
              {dragging ? 'Drop it here' : 'Click to upload an image'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              or drag and drop · JPG, PNG, WebP · Max {MAX_MB} MB
            </p>
          </div>
        </button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};
