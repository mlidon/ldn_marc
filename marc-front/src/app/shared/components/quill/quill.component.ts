import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Quill from 'quill';

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

  private quill: Quill | null = null;
  private htmlValue = '';
  private isDisabled = false;

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
            image: () => this.insertImageByUrl(),
            video: () => this.insertVideoByUrl(),
          },
        },
      },
    });

    this.quill.on('text-change', () => {
      const value = this.getCurrentHtml();
      this.htmlValue = value;
      this.onChange(value);
    });

    this.quill.on('selection-change', (range, oldRange) => {
      if (range === null && oldRange !== null) {
        this.onTouched();
      }
    });

    this.applyValue(this.htmlValue);
    this.quill.enable(!this.isDisabled);
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
    this.quill?.enable(!isDisabled);
  }

  private applyValue(value: string): void {
    if (!this.quill) {
      return;
    }

    if (!value) {
      this.quill.setText('');
      return;
    }

    this.quill.clipboard.dangerouslyPasteHTML(value, 'api');
  }

  private getCurrentHtml(): string {
    const html = this.quill?.root.innerHTML ?? '';
    return html === '<p><br></p>' ? '' : html;
  }

  private insertImageByUrl(): void {
    if (!this.quill) {
      return;
    }

    const imageUrl = window.prompt('Enter an image URL');
    if (!imageUrl) {
      return;
    }

    const range = this.quill.getSelection(true);
    const index = range?.index ?? this.quill.getLength();

    // TODO: Replace URL insertion with backend upload integration when upload API wiring is ready.
    this.quill.insertEmbed(index, 'image', imageUrl, 'user');
    this.quill.setSelection(index + 1, 0, 'silent');
  }

  private insertVideoByUrl(): void {
    if (!this.quill) {
      return;
    }

    const videoUrl = window.prompt('Enter a video URL (YouTube supported)');
    if (!videoUrl) {
      return;
    }

    const range = this.quill.getSelection(true);
    const index = range?.index ?? this.quill.getLength();

    this.quill.insertEmbed(index, 'video', videoUrl, 'user');
    this.quill.setSelection(index + 1, 0, 'silent');
  }
}
