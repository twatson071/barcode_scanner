import { Component, ViewChild, NgZone } from '@angular/core';
import * as Quagga from 'quagga';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  selector: 'my-app',
  template: `<button (click)="openScanner()">Scan</button>
  <modal (onDismiss)="close()" #Modal>
  <modal-header [show-close]="true">
      <h4 class="modal-title">Scan your barcode</h4>
  </modal-header>
  <modal-body>
  <div id="interactive" class="viewport clearfix" #interactive></div>
  </modal-body>
</modal>
              Code: {{output}}`
})
export class AppComponent {
  @ViewChild('Modal') modal: ModalComponent;
  CameraIsAvailable: boolean = false;
  quaggaConfig: any;
  output: string;
  html: string;

  constructor(private zone: NgZone) {
    this.quaggaConfig = {
      locator: {
        patchSize: 'medium',
        halfSample: false,
        boxFromPatches: {
          showTransformed: true,
          showTransformedBox: true,
          showBB: true
        }
      },
      inputStream: {
        type: 'LiveStream',
        constraints: {
          width: {
            min: 400
          },
          height: {
            min: 400
          },
          facingMode: 'environment',
          aspectRatio: {
            min: 1,
            max: 2
          }
        }
      },
      numOfWorkers: 1,
      decoder: {
        readers: [
          'ean_reader',
          'code_128_reader',
          'ean_8_reader',
          'code_39_reader',
          'code_39_vin_reader',
          'codabar_reader',
          'upc_reader',
          'upc_e_reader',
          'i2of5_reader'
        ]
      },
      locate: true
    };
  }

  openScanner() {
    this.open();
    this.CameraIsAvailable = navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';
    if (this.CameraIsAvailable) {
      Quagga.init(this.quaggaConfig, (err: any) => {
        if (err) {
          throw new Error(err);
        }
        Quagga.start();
      });
    }
    this.onProcessed();
    this.onDecodeDetected();
  }
  // Open and close methods for the modal
  open() {
    this.modal.open();
  }
  close() {
    this.modal.close();
    Quagga.stop();
  }
  onProcessed() {
    Quagga.onProcessed(result => {
      const drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;
      if (result) {
        if (result.boxes) {
          drawingCtx.clearRect(
            0,
            0,
            parseInt(drawingCanvas.getAttribute('width')),
            parseInt(drawingCanvas.getAttribute('height'))
          );
          result.boxes
            .filter(function(box) {
              return box !== result.box;
            })
            .forEach(function(box) {
              Quagga.ImageDebug.drawPath(
                box,
                {
                  x: 0,
                  y: 1
                },
                drawingCtx,
                {
                  color: 'green',
                  lineWidth: 2
                }
              );
            });
        }
        if (result.box) {
          Quagga.ImageDebug.drawPath(
            result.box,
            {
              x: 0,
              y: 1
            },
            drawingCtx,
            {
              color: '#00F',
              lineWidth: 2
            }
          );
        }

        if (result.codeResult && result.codeResult.code) {
          Quagga.ImageDebug.drawPath(
            result.line,
            {
              x: 'x',
              y: 'y'
            },
            drawingCtx,
            {
              color: 'red',
              lineWidth: 3
            }
          );
        }
      }
    });
  }
  onDecodeDetected() {
    Quagga.onDetected(result => {
      if (!result || typeof result.codeResult === 'undefined') {
        console.log('Cannot be Detected, Please Try again!');
      }

      // Close the modal
      this.close();

      // Force interpolation on the template
      this.zone.run(() => {
        this.output = result.codeResult.code;
      });
    });
  }
}
