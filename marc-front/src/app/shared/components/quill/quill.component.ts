import { AfterViewInit, Component, ElementRef, forwardRef, inject, OnDestroy, viewChild,} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Quill from 'quill';
import { finalize } from 'rxjs';
import { UploadService } from '../../../core/services/upload.service';
import { environment } from '../../../../environments/environment.development';


@Component({
  selector: 'app-quill',
  templateUrl: './quill.component.html',
  styleUrl: './quill.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuillComponent),
      multi: true,
    },
  ],
})
export class QuillComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private readonly editorHost = viewChild.required<ElementRef<HTMLDivElement>>('editorHost');
  private readonly toolbarHost = viewChild.required<ElementRef<HTMLDivElement>>('toolbarHost');
  private readonly imageInput = viewChild.required<ElementRef<HTMLInputElement>>('imageInput');
  private readonly uploadService = inject(UploadService);

  private quill: Quill | null = null;
  private htmlValue = '';
  private isDisabled = false;
  private isUploadingImage = false;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  ngAfterViewInit(): void {
    this.quill = new Quill(this.editorHost().nativeElement, {
      theme: 'snow',
      placeholder: 'Write your content here...',
      modules: {
        toolbar: {
          container: this.toolbarHost().nativeElement,
          handlers: {
            image: () => this.openImagePicker(),
            video: () => this.insertVideoByUrl(),
          },
        },
      },
    });

    // ✅ PASTE IMAGE
    this.quill.root.addEventListener('paste', (event: ClipboardEvent) => {
      if (!event.clipboardData) return;

      const items = Array.from(event.clipboardData.items);
      const imageItem = items.find(item => item.type.startsWith('image/'));

      if (!imageItem) return;

      event.preventDefault();

      const file = imageItem.getAsFile();
      if (!file) return;

      this.uploadAndInsertImage(file);
    });

    this.quill.root.addEventListener('drop', (event: DragEvent) => {
      event.preventDefault();

      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];

      if (!file.type.startsWith('image/')) return;

      this.uploadAndInsertImage(file);
    });


    // ✅ CHANGE
    this.quill.on('text-change', () => {
      const value = this.getCurrentHtml();
      this.htmlValue = value;
      this.onChange(value);
    });

    // ✅ TOUCH
    this.quill.on('selection-change', (range, oldRange) => {
      if (range === null && oldRange !== null) {
        this.onTouched();
      }
    });

    this.quill.root.addEventListener('dragover', (event: DragEvent) => {
      event.preventDefault();
    });
    this.applyValue(this.htmlValue);
    this.quill.enable(!this.isDisabled && !this.isUploadingImage);
  }

  ngOnDestroy(): void {
    if (this.quill) {
      this.quill.off('text-change');
      this.quill.off('selection-change');
    }
  }

  writeValue(value: string | null): void {
    this.htmlValue = value ?? '';
    this.applyValue(this.htmlValue);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.quill?.enable(!isDisabled && !this.isUploadingImage);
  }

  // ✅ FILE SELECT
  onImageSelected(event: Event): void {
    if (!this.quill || this.isDisabled || this.isUploadingImage) return;

    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);

    if (!file) return;

    this.uploadAndInsertImage(file);

    // reset input
    input.value = '';
  }

  private applyValue(value: string): void {
    if (!this.quill) return;

    if (!value) {
      this.quill.setText('');
      return;
    }

    this.quill.clipboard.dangerouslyPasteHTML(value, 'api');
  }

  private getCurrentHtml(): string {
    const html = this.quill?.root.innerHTML ?? '';

    if (html === '<p><br></p>') {
      return '';
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    wrapper.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
      const background = element.style.backgroundColor;
      const color = element.style.color;

      if (
        background === 'white' ||
        background === '#fff' ||
        background === '#ffffff' ||
        background === 'rgb(255, 255, 255)'
      ) {
        element.style.backgroundColor = 'transparent';
      }

      if (
        color === 'black' ||
        color === '#000' ||
        color === '#000000' ||
        color === 'rgb(0, 0, 0)'
      ) {
        element.style.color = 'var(--text-main)';
      }

      if (!element.getAttribute('style')?.trim()) {
        element.removeAttribute('style');
      }
    });

    return wrapper.innerHTML;
  }

  private openImagePicker(): void {
    if (!this.quill || this.isDisabled || this.isUploadingImage) return;

    const input = this.imageInput().nativeElement;
    input.value = '';
    input.click();
  }

  // ✅ VIDEO
  private insertVideoByUrl(): void {
    if (!this.quill) return;

    const videoUrl = window.prompt('Introduce una URL de YouTube');
    if (!videoUrl) return;

    const embedUrl = this.toYouTubeEmbedUrl(videoUrl.trim());

    if (!embedUrl) {
      window.alert('URL de YouTube no válida.');
      return;
    }

    const range = this.quill.getSelection(true);
    const index = range?.index ?? this.quill.getLength();

    this.quill.insertEmbed(index, 'video', embedUrl, 'user');
    this.quill.setSelection(index + 1, 0, 'silent');
  }

  private toYouTubeEmbedUrl(url: string): string | null {
    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.hostname.includes('youtube.com')) {
        const videoId = parsedUrl.searchParams.get('v');
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsedUrl.hostname === 'youtu.be') {
        const videoId = parsedUrl.pathname.replace('/', '');
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }

      return null;
    } catch {
      return null;
    }
  }

  // ✅ INSERT IMAGE
  private insertImageEmbed(imageUrl: string): void {
    if (!this.quill) return;

    const range = this.quill.getSelection(true);
    const index = range?.index ?? this.quill.getLength();

    this.quill.insertEmbed(index, 'image', imageUrl, 'api');
    this.quill.insertText(index + 1, '\n', 'api');
    this.quill.setSelection(index + 2, 0, 'silent');

    const value = this.getCurrentHtml();
    this.htmlValue = value;
    this.onChange(value);
  }

  // ✅ UPLOAD
  private uploadAndInsertImage(file: File): void {
  if (!this.quill || this.isUploadingImage) return;

  this.isUploadingImage = true;
  this.quill.enable(false);

  this.uploadService
    .uploadFile(file)
    .pipe(
      finalize(() => {
        this.isUploadingImage = false;
        this.quill?.enable(!this.isDisabled);
      }),
    )
    .subscribe({
      next: (imageUrl) => {
        const finalUrl = this.toAbsoluteUrl(imageUrl);

        console.log('FINAL IMAGE URL:', finalUrl);

        // Importante: reactivar antes de insertar
        this.quill?.enable(true);

        this.insertImageEmbed(finalUrl);
      },
      error: () => window.alert('No se pudo subir la imagen.'),
    });
}

  private toAbsoluteUrl(url: string): string {
    if (!url) return '';

    if (url.startsWith('http')) return url;

    return `${environment.backendUrl}${url}`;
  }
}