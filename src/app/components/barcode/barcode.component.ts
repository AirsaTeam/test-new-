import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';

@Component({
  selector: 'app-barcode',
  standalone: false,
  template: `<canvas #barcodeCanvas></canvas>`,
  styles: [
    `
      canvas {
        max-width: 100%;
        height: auto;
      }
    `,
  ],
})
export class BarcodeComponent implements AfterViewInit, OnChanges {
  @Input() value = '';
  @Input() height = 40;
  @Input() width = 2;
  @ViewChild('barcodeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private draw(): void {
    if (typeof window === 'undefined' || !this.value?.trim() || !this.canvasRef?.nativeElement) return;
    import('jsbarcode').then((m) => {
      const JsBarcode = m.default ?? m;
      try {
        JsBarcode(this.canvasRef.nativeElement, this.value.trim(), {
          format: 'CODE128',
          width: this.width,
          height: this.height,
          displayValue: true,
        });
      } catch {
        // ignore invalid barcode value
      }
    });
  }

  ngAfterViewInit(): void {
    this.draw();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange && this.canvasRef?.nativeElement) {
      this.draw();
    }
  }
}
